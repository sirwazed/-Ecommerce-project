import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { CartService } from 'src/app/services/cart.service';
import { NotifierService } from 'src/app/services/notifier.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  public cartItem:any = [];
  serverUrl = 'https://ecommerceapinodejsofhasan.herokuapp.com/';
  isLoaded:boolean = false;
  public products:any=[];
  public grandTotal:number = 0;
  constructor(private CartService: CartService,
    private api: ApiService,
    private snackBar: NotifierService) { }

  ngOnInit(): void {
    this.setupPage();
  }

  setupPage(){
    this.api.getCartItems().subscribe(res=>{
      this.isLoaded = true;
      this.cartItem = res;
      this.getDetails();
      //console.log(this.products);
    })
  }
  getDetails(){
    this.cartItem.forEach((item:any)=>{
      this.api.getProductByCode(item.productShortCode).subscribe((res)=>{
        let product = res[0];
        //console.log(res[0]);
        Object.assign(product,{quantity:item.quantity,total: res[0].price*item.quantity});
        this.grandTotal += product.total;
        this.products.push(product);
        this.products.forEach((element:any)=>{
          if(element.imageUrl.includes('uploads/')){
            element.imageUrl = this.serverUrl+element.imageUrl;
        }
        })
      })
    })
    //console.log(`products = ${this.products}`);
  }

  removeItem(item:any){
    //console.log(item);
    this.api.deleteCartItem(item.productShortCode).subscribe((res)=>{
      if(res){
        //alert('Product deleted successfully');
        this.snackBar.showNotification('Product deleted successfully','Ok', 'success');
        this.CartService.removeCartItem(item);
        this.cartItem = [];
        this.products = [];
        this.grandTotal = 0;
        this.setupPage();
      }
    }
    )
  }
  conso(quantity:any, item:any){
    this.products.forEach((ele:any)=>{
      if(ele.id === item.id){
        ele.quantity = quantity;
        let temp = ele.total; 
        ele.total = ele.quantity*ele.price;
        this.grandTotal += (ele.total-temp); 
      }
    })
  }

  emptyCart(){
    this.isLoaded = false;
    this.api.deleteAllCartItems().subscribe((res)=>{
      this.isLoaded = true;
      this.cartItem = [];
      this.products = [];
      this.grandTotal = 0;
      this.CartService.removeAllCart();
    },(err)=>{
      this.snackBar.showNotification(err.message,'Ok', 'error');
      //alert(err.message);
    }
    )
    
  }

}
