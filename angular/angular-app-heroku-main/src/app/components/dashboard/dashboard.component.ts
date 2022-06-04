import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import {} from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { UserAuthService } from 'src/app/services/user-auth.service';
import { PageEvent } from '@angular/material/paginator';
import * as io from 'socket.io-client';
import { NotifierService } from 'src/app/services/notifier.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  isLoaded: boolean = false;
  isCategory: boolean = false;
  itemNumber = 1;
  productList:any = [];
  serverUrl = 'https://ecommerceapinodejsofhasan.herokuapp.com/';
  private socket:any;
  public socketData:any;
  constructor(private apiService: ApiService,
    private cartService: CartService,
    private userAuthService: UserAuthService,
    private snackBar: NotifierService,
    ) {
    }
  ngOnInit(): void {
    this.socket = io.connect(this.serverUrl,{transports: ['websocket'], upgrade: false});
    this.apiService.getProduct(1).subscribe((res)=>{
      this.productList = res;
      this.isLoaded = true;
      this.alignQuantity();

      this.socket.on('notification', (data:any)=>{
        //alert('A product details has been changed');
        this.snackBar.showNotification('A product details has been changed','Ok', 'success');
        this.socketData = data;
        //console.log(this.socketData);
        this.productList.forEach((element:any)=>{
          if(element.id === this.socketData.id){
            element.productName = this.socketData.data.productName;
            element.productShortCode = this.socketData.data.productShortCode;
            element.category = this.socketData.data.category;
            element.price = this.socketData.data.price;
            element.description = this.socketData.data.description;
            element.imageUrl = this.socketData.data.imageUrl;
            element.isBestAchived = this.socketData.data.isBestAchived;
            element.origin = this.socketData.data.origin;
            //console.log(element);
          }
        })
      })
    })
  }
  ngOnDestroy(): void {
    this.socket.disconnect();
  }

  increment(index:any){
    this.productList[index].quantity+=1;
  }
  decrement(index:any){
    if(this.productList[index].quantity>1){
      this.productList[index].quantity-=1;
    }
  }

  alignQuantity(){
    this.productList.forEach((element: any) => {
      Object.assign(element,{quantity:1,total:element.price})
    });
  }

  addToCart(product: any){
    this.cartService.addToCart(product);
    //console.log(`product in dashboard = ${product}`);
    // new code
    // save in db
    let item = {};
    let username = this.userAuthService.getUserName();
    Object.assign(item, {username: username, productShortCode: product.productShortCode, quantity: product.quantity });
    //console.log(item);
    this.apiService.addToCart(item).subscribe((res)=>{
      //console.log(res);
      item = {};
    },(err)=>{
      //console.log(err);
      item = {};
    })
  }
  test(text:any){
    this.productList = [];
    this.isLoaded = false;
    if(text === 'all'){
      this.apiService.getProduct(1).subscribe((res)=>{
        this.productList = res;
        this.isLoaded = true;
        this.isCategory = false;
        this.alignQuantity();
      })
    }else{
      this.apiService.getByCategory(text).subscribe((res)=>{
        this.isCategory = true;
        this.productList = res;
        this.isLoaded = true;
        this.alignQuantity();
      })
    }
    
  }

  pageIndex = 0;

  onPageChange(event:PageEvent){
    //console.log(event);
    this.pageIndex = event.pageIndex;
    this.productList = [];
    this.isLoaded = false;
    //console.log(`pageIndex = ${event.pageIndex}`)
    this.apiService.getProduct(event.pageIndex+1).subscribe((res)=>{
      this.productList = res;
      this.isLoaded = true;
      this.alignQuantity();
    })
    //console.log(event);
  }
  
}
