import { ViewChild, Component, OnInit } from '@angular/core';
import { ProductFormComponent } from '../product-form/product-form.component';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { NotifierService } from 'src/app/services/notifier.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  isLoading:boolean = true;
  isLoaded:boolean = true;
  ofset:any;
  products:any = [];

  displayedColumns: string[] = ['productName', 'productShortCode', 'category', 'price', 'description', 'imageUrl', 'isBestAchived', 'CreatedDate', 'origin', 'action'];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog,
    private api: ApiService,
    private snackBar: NotifierService
    ) { }

  ngOnInit(): void {
    this.getAllProduct(0);
  }
  openDialog() {
    this.dialog.open(ProductFormComponent, {
      width: '30%'
    }).afterClosed().subscribe((val)=>{
      if(val === 'Save') this.getAllProduct(0);
    });
  }

  getAllProduct(ofset:any){
    this.api.getProduct(0).subscribe({
      next: (res)=>{
        this.isLoading = false;
        this.products = res;
        this.products.forEach((product:any)=>{
          if(product.isBestAchived === true){
            product.isBestAchived = 'true';
          }
          else{
            product.isBestAchived = 'false';
          }
        })
        this.dataSource = new MatTableDataSource(this.products);
        this.dataSource.paginator = this.paginator;
      },
      error: (err)=>{
        this.snackBar.showNotification("Error while fetching the record",'Ok', 'error');
        //alert('Error while fetching the record');
      }
    })
  }

  response:any;

  deleteProduct(id:any){
    this.isLoaded = false;
    this.api.deleteProduct(id).subscribe({
      next: (res)=>{
        this.isLoaded = true;
        this.response = res;
        //alert(this.response.message);
        this.snackBar.showNotification(this.response.message,'Ok', 'success');
        this.getAllProduct(0);
      },
      error: (err)=>{
        this.isLoaded = true;
        this.snackBar.showNotification(err,'Ok', 'error');
        //alert(err);
      }
    })
  }

  editProduct(row:any){
    this.dialog.open(ProductFormComponent, {
      width: '30%',
      data: row
    }).afterClosed().subscribe((val)=>{
      if(val === 'Update') this.getAllProduct(0);
    })
  }

}
