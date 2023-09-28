import { saveAs } from 'file-saver';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BillService } from 'src/app/services/bill.service';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobleConstants } from 'src/app/shared/globle-constants';



@Component({
  selector: 'app-manage-order',
  templateUrl: './manage-order.component.html',
  styleUrls: ['./manage-order.component.scss'],
})
export class ManageOrderComponent implements OnInit {
  displayedColumn: string[] = [
    'name',
    'category',
    'quantity',
    'price',
    'total',
    'edit',
  ];
  dataSource: any;
  responseMessage: any;
  manageOrderForm: any = FormGroup;
  categorys: any = [];
  products: any = [];
  price: any;
  totalAmount: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackbarService,
    private billService: BillService
  ) {}

  ngOnInit(): void {
    this.ngxService.start();
    this.getCategory();
    this.manageOrderForm = this.formBuilder.group({
      name: [
        null,
        [Validators.required, Validators.pattern(GlobleConstants.nameRegex)],
      ],
      email: [
        null,
        [Validators.required, Validators.pattern(GlobleConstants.emailRegex)],
      ],
      contactNumber: [
        null,
        [
          Validators.required,
          Validators.pattern(GlobleConstants.contactNumberRegex),
        ],
      ],
      paymentMethod: [null, [Validators.required]],
      product: [null, [Validators.required]],
      category: [null, [Validators.required]],
      quantity: [null, [Validators.required]],
      price: [null, [Validators.required]],
      total: [0, [Validators.required]],
    });
  }

  getCategory() {
    this.categoryService.getFilteredCategorys().subscribe(
      (response: any) => {
        this.ngxService.stop();
        this.categorys = response;
      },
      (error: any) => {
        this.ngxService.stop();
        console.log(error);
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = GlobleConstants.genericError;
        }
        this.snackbarService.openSnackBar(
          this.responseMessage,
          GlobleConstants.error
        );
      }
    );
  }

  getProductByCategory(value: any) {
    this.productService.getProductByCategory(value.id).subscribe(
      (response: any) => {
        this.products = response;
        this.manageOrderForm.controls['price'].setValue('');
        this.manageOrderForm.controls['quantity'].setValue('');
        this.manageOrderForm.controls['total'].setValue(0);
      },
      (error: any) => {
        console.log(error);
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = GlobleConstants.genericError;
        }
        this.snackbarService.openSnackBar(
          this.responseMessage,
          GlobleConstants.error
        );
      }
    );
  }

  getProductDetails(value: any) {
    this.productService.getProductById(value.id).subscribe(
      (response: any) => {
        this.price = response.price;
        this.manageOrderForm.controls['price'].setValue(response.price);
        this.manageOrderForm.controls['quantity'].setValue('1');
        this.manageOrderForm.controls['total'].setValue(this.price * 1);
      },
      (error: any) => {
        console.log(error);
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = GlobleConstants.genericError;
        }
        this.snackbarService.openSnackBar(
          this.responseMessage,
          GlobleConstants.error
        );
      }
    );
  }

  setQuantity(value: any) {
    var temp = this.manageOrderForm.controls['quantity'].value;
    if (temp > 0) {
      this.manageOrderForm.controls['total'].setValue(
        this.manageOrderForm.controls['quantity'].value *
          this.manageOrderForm.controls['price'].value
      );
    } else if (temp != '') {
      this.manageOrderForm.controls['quantity'].setValue('1');
      this.manageOrderForm.controls['total'].setValue(
        this.manageOrderForm.controls['quantity'].value *
          this.manageOrderForm.controls['price'].value
      );
    }
  }

  validateproductAdd() {
    if (
      this.manageOrderForm.controls['total'].value === 0 ||
      this.manageOrderForm.controls['total'].value === null ||
      this.manageOrderForm.controls['quantity'].value <= 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  validateSubmit() {
    if (
      this.totalAmount === 0 ||
      this.manageOrderForm.controls['name'].value === null ||
      this.manageOrderForm.controls['contactNumber'].value === null ||
      this.manageOrderForm.controls['paymentMethod'].value
    ) {
      return true;
    } else {
      return false;
    }
  }

  add() {
    var formData = this.manageOrderForm.value;
    
    if (!this.dataSource) {
      this.dataSource = [];
    }
    var productName = this.dataSource.find(
      (e: { id: number }) => e.id === formData.product.id
    );
    if (productName === undefined) {
      this.totalAmount = this.totalAmount + formData.total;
      console.log('Total Amount:', this.totalAmount);

      this.dataSource.push({
        id: formData.product.id,
        name: formData.product.name,
        category: formData.category.name,
        quantity: formData.quantity,
        price: formData.price,
        total: formData.total,
      });
      this.dataSource = [...this.dataSource];
      this.snackbarService.openSnackBar(
        GlobleConstants.productedAdded,
        'success'
      );
    } else {
      this.snackbarService.openSnackBar(
        GlobleConstants.productExistError,
        GlobleConstants.error
      );
    }
  }

  handleDeleteAction(value: any, element: any) {
    this.totalAmount = this.totalAmount - element.total;
    this.dataSource.splice(value, 1);
    this.dataSource = [...this.dataSource];
  }

  submitAction() {
    var formdata = this.manageOrderForm.value;
    var data = {
      name: formdata.name,
      email: formdata.email,
      contactNumber: formdata.contactNumber,
      paymentMethod: formdata.paymentMethod,
      totalAmount: this.totalAmount.toString(),
      productDetails: JSON.stringify(this.dataSource),
    };
    this.ngxService.start();
    this.billService.generateReport(data).subscribe(
      (response: any) => {
        this.downlordFile(response?.uuid);
        this.manageOrderForm.reset();
        this.dataSource = [];
        this.totalAmount = 0;
      },
      (error: any) => {
        console.log(error);
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = GlobleConstants.genericError;
        }
        this.snackbarService.openSnackBar(
          this.responseMessage,
          GlobleConstants.error
        );
      }
    );
  }

  downlordFile(fileName: string) {
    var data = {
      uuid:fileName
    }
    this.billService.getPdf(data).subscribe((response:any)=>{
      saveAs(response, fileName + '.pdf');
      this.ngxService.stop();
    })
  }
}
