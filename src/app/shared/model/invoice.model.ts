import { ProductModel } from './product.model';
export class InvoiceModel{

    customerName: string;
    address: string;
    contactNo: number;
    email: string;
    number: number;
    date: Date;
    partyGstin: any;
    state: string;
    stateCode: number;
    ewayBill: any;
    vehicleNumber: any;

    products: ProductModel[] = [];
    additionalDetails: string;

    constructor(){
      // Initially one empty product row we will show
      this.products.push(new ProductModel());
    }


}
