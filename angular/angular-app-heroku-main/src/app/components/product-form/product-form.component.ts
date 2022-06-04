import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConditionalExpr } from '@angular/compiler';
import { NotifierService } from 'src/app/services/notifier.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {

  isLoaded = true;
  selectedFile: any = null;
  btnName = 'Save';
  productForm !: FormGroup;
  constructor(private formBuilder: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    private snackBar: NotifierService,
    @Inject(MAT_DIALOG_DATA) public editData: any,
    ) { }

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      productName: ['',Validators.required],
      productShortCode: ['',Validators.required],
      category: ['',Validators.required],
      price: ['',Validators.required],
      description: [''],
      imageUrl: [''],
      isBestAchived: [Boolean],
      CreatedDate: ['',Validators.required],
      origin: ['',Validators.required],
    });

    if(this.editData){
      this.btnName = 'Update';
      this.productForm.controls['productName'].setValue(this.editData.productName);
      this.productForm.controls['productShortCode'].setValue(this.editData.productShortCode);
      this.productForm.controls['category'].setValue(this.editData.category);
      this.productForm.controls['price'].setValue(this.editData.price);
      this.productForm.controls['description'].setValue(this.editData.description);
      this.productForm.controls['imageUrl'].setValue(this.editData.imageUrl);
      this.productForm.controls['isBestAchived'].setValue(this.editData.isBestAchived);
      this.productForm.controls['CreatedDate'].setValue(this.editData.CreatedDate);
      this.productForm.controls['origin'].setValue(this.editData.origin);
    }
  }
  addProduct(){
    //console.log('oka');
    if(!this.editData){
      this.isLoaded = false;
      //console.log('oka2');
      if(this.productForm.valid){
        this.formDataCreator();
        //console.log(`this.fd = ${this.fd.forEach(function(val,key,fD){console.log(val)})}`);
        this.api.addProduct(this.fd).subscribe({
          next:(res)=>{
            this.isLoaded = true;
            this.snackBar.showNotification("Product added successfully",'Ok', 'success');
            //alert("Product added successfully");
            this.productForm.reset();
            this.fd.forEach(function(val,key,fD){
              fD.delete(key);
            });
            this.dialogRef.close('Save');
          },
          error:(res)=>{
            this.isLoaded = true;
            this.snackBar.showNotification(res.message,'Ok', 'error');
            //alert(res.message);
            //console.log(res);
          }
        })
      }
    }else{
      //console.log('editData');
      this.editProduct();
    }
  }

  editProduct(){
    this.isLoaded = false;
    this.formDataCreator();
    //console.log(`this.fd = ${this.fd.forEach(function(val,key,fD){console.log(val)})}`);
    this.api.editProduct(this.fd, this.editData.id).subscribe({
      next: (res)=>{
        this.isLoaded = true;
        this.api.sendNotification(this.productForm.value, this.editData.id).subscribe();
        this.snackBar.showNotification("Product edited successfully",'Ok', 'success');
        //alert("Product edited successfully");
        this.productForm.reset();
        this.dialogRef.close('Update');
        this.fd.forEach(function(val,key,fD){
          fD.delete(key);
        });
        //console.log(this.productForm.value);
      },
      error: (err)=>{
        this.isLoaded = true;
        this.snackBar.showNotification(err,'Ok', 'error');
        //alert(err);
      }
    })
  }

  fd = new FormData;

  formDataCreator(){
    this.fd.append('productName', this.productForm.value.productName);
    this.fd.append('productShortCode', this.productForm.value.productShortCode);
    this.fd.append('category', this.productForm.value.category);
    this.fd.append('price', this.productForm.value.price);
    this.fd.append('description', this.productForm.value.description);
    this.fd.append('isBestAchived', this.productForm.value.isBestAchived);
    this.fd.append('CreatedDate', this.productForm.value.CreatedDate);
    this.fd.append('origin', this.productForm.value.origin);
    if(!this.fd.has('imageUrl')){
      this.fd.append('imageUrl', this.productForm.value.imageUrl);
    }
  }

  fileSelected(event: any){
    this.selectedFile = event.target.files[0];
    //console.log(this.selectedFile);
    this.fd.append('imageUrl', this.selectedFile);
    //console.log(`this.fd in fileselected = ${this.fd.forEach(function(val,key,fD){console.log(val)})}`);
    //console.log(`fd = ${this.fd.has('imageUrl')}`);
  }

}
