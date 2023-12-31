import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatTableDataSource } from '@angular/material/table';
import { GlobleConstants } from 'src/app/shared/globle-constants';
import { ProductComponent } from '../dialog/product/product.component';
import { ConfirmationComponent } from '../dialog/view-bill-products/confirmation/confirmation.component';
@Component({
  selector: 'app-manage-product',
  templateUrl: './manage-product.component.html',
  styleUrls: ['./manage-product.component.scss'],
})
export class ManageProductComponent implements OnInit {
  displayedColumn: string[] = [
    'name',
    'categoryName',
    'description',
    'price',
    'edit',
  ];
  dataSource: any;
  responseMessage: any;
  length: any;

  constructor(
    private productService: ProductService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackbarService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }
  tableData() {
    this.productService.getProduct().subscribe(
      (response: any) => {
        this.ngxService.stop();
        this.dataSource = new MatTableDataSource(response);
      },
      (error: any) => {
        console.log(error.error?.message);
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
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  handleEditAction(values: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'Edit',
      data: values,
    };
    dialogConfig.width = '850px';
    const dialogRef = this.dialog.open(ProductComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onEditProduct.subscribe(
      (response: any) => {
        this.tableData();
         this.responseMessage = response?.message;
      }
    );
  }

  handleAddAction() {
     const dialogConfig = new MatDialogConfig();
     dialogConfig.data = {
       action: 'Add',
     };
     dialogConfig.width = '850px';
     const dialogRef = this.dialog.open(ProductComponent, dialogConfig);
     this.router.events.subscribe(() => {
       dialogRef.close();
     });
     const sub = dialogRef.componentInstance.onAddProduct.subscribe(
       (response: any) => {
         this.tableData();
          this.responseMessage = response?.message;
       }
     );
  }

  handleDeleteAction(value: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message:'delete ' +value.name+ ' product',
      confirmation:true
    };
    dialogConfig.width = '850px';
    const dialogRef = this.dialog.open(ConfirmationComponent, dialogConfig);
     const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((response:any)=>{
      this.ngxService.start();
      this.deleteProduct(value.id);
      dialogRef.close();
      this.responseMessage = response?.message;
     })

      }
  deleteProduct(id:any){
    this.productService.deleteProduct(id).subscribe((response:any)=>{
      this.ngxService.stop();
      this.tableData();
      this.responseMessage = response?.message;
      this.snackbarService.openSnackBar(this.responseMessage, 'success');

    },(error:any)=>{
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
    }) ;
  }

  onChange(status:any,id:any){

     this.ngxService.start();
     var data = {
      status:status.toString(),
      id:id
     }
     this.productService.updateStatus(data).subscribe((response:any)=>{
      this.ngxService.stop();
      this.responseMessage = response?.message;
      this.snackbarService.openSnackBar(
         this.responseMessage,'success');

       },(error:any)=>{
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
       });
  }
}
