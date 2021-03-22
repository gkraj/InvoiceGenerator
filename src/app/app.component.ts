import { Component } from '@angular/core';
import { ToWords } from 'to-words';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { formatDate } from '@angular/common';
import { formatAmount } from 'indian-currency-formatter'

pdfMake.vfs = pdfFonts.pdfMake.vfs;

class Product{
  name: string;
  hsnCode: any;
  price: number;
  qty: number;
}
class Invoice{
  customerName: string;
  address: string;
  contactNo: number;
  email: string;
  number: number;
  date: Date;
  partyGstin: any;
  state: string;
  stateCode: number;
  ewayBill: any = '';
  vehicleNumber: any;
  company: any;

  products: Product[] = [];
  additionalDetails: string;

  constructor(){
    // Initially one empty product row we will show
    this.products.push(new Product());

  }
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  invoice = new Invoice();
  rashmiDetails = {
    name : 'RESHMI TRADERS',
    bank: 'RESHMI TRADERS \n ICICI -A/c : 283705500127 \n  Harur Branch \n IFC Code - ICIC0002837',
    address: 'MOOKKANURPATTI (VILL), Sandapatti-PO, Harur- TK, Dharmapuri-DT, Tamil Nadu',
    gst: '33BKVPS8439K1Z5',
    phone: '94458 37788'
  };
  arsDetails = {
    name : 'ARS TRADERS',
    bank: 'ARS TRADERS \n ICICI Bank -A/c : 283705500131 \n  Harur Branch \n IFC Code - ICIC0002837',
    address: 'GOBINATHAMPATTI KOOTU ROAD, Parayapatti Pudur - PO, Pappireddipatti - TK, Dharmapuri-DT, Tamil Nadu, PIN:636903',
    gst: '33AZUPA2010M1ZK',
    phone: '94428 09199'
  };
  totalVal;
  name;
  bank;
  address;
  gst;
  qr : any;
  phone;

  lorryNumber = [
    {id:0, number: "TN 29 BS 2288"},
    {id:1, number: "TN 29 CX 2288"}
  ]

  companyName = [
    {id:0, name: 'Reshmi Traders'},
    {id:1, name: 'ARS Traders'}
  ]

  generatePDF(action = 'open') {
    let docDefinition = {
      content: [
        {
          columns: [
            [
              { text: `GSTIN: ${this.gst}`, alignment: 'left', fontSize: 9}
            ],
            [
              { text: 'Jaisri Krishna', alignment: 'center', fontSize: 9 },
              { text: 'TAX INVOICE CASH / CREDIT', alignment: 'center', fontSize: 9}
            ],
            [
              { text: `Mobile: ${this.phone}`, alignment: 'right', fontSize: 9},
              { text: `E-mail: southri3388@gmail.com`, alignment: 'right', fontSize: 9}
            ]
          ],
          margin: [0, 15 ,0, 15]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [ { text: `${this.name}`, bold: true, alignment: 'center', fontSize: 20, border: [true, true, true, false] }],
              [ { text: 'Dealer: GRANITE SLABS, TILES AND MACHINARIES', alignment: 'center', fontSize: 12, border: [true, false, true, false] }],
              [ { text: `${this.address}`, alignment: 'center', fontSize: 10, border: [true, false, true, true] }]
            ]
          }
        },
        {
          alignment: 'justify',
          columns: [
            [ { text: `Invoice No : ${this.invoice.number}`, alignment: 'left', fontSize: 11} ],
            [ { text: 'State: TamilNadu, State Code: 33', alignment: 'center', fontSize: 11 } ],
            [ { text: `Date: ${this.formattedDate()}`, alignment: 'right', fontSize: 11} ]
          ],
          margin: [0, 5 ,0, 5]
        },
        {
          table: {
            widths: ['*', 'auto','auto'],
            body: [
              [{text: `M/s: ${this.invoice.customerName}`, fontSize: 12}, {colSpan: 2, text: `Party GSTIN: ${this.invoice.partyGstin}`, fontSize: 12}, ''],
              [{rowSpan: 3, text: ` Addresss: ${this.invoice.address}`, fontSize: 12}, {text: `State: ${this.invoice.state}`, fontSize: 12},
                {text: `State Code: ${this.invoice.stateCode}`, fontSize: 12} ],
              ['', {colSpan: 2, text: `Vehicle No: ${this.invoice.vehicleNumber}`, fontSize: 12}, '' ],
              ['', {colSpan: 2, text: `EWay Bill No: ${this.invoice.ewayBill}`, fontSize: 12}, '' ]
            ]
          }
        },
        {
          text: 'Order Details',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [{alignment: 'center', text: 'Paticulars'}, {alignment: 'center', text: 'HSN Code'}, {alignment: 'center', text: 'Qty (Sq.Mtr)'}, {alignment: 'center', text: 'Rate (Per.Sq.Mtr)'}, {alignment: 'center', text: 'Amount'}],
              ...this.invoice.products.map(p => ([p.name, p.hsnCode, p.qty, p.price, (p.price*p.qty).toFixed(2)])),
              [{colSpan:5, text: '.'},'','','',''],
              [{rowSpan: 3, colSpan: 3, text: `Bank Detail: ${this.bank}` } ,'','','Taxable Value', this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2)],
              ['','','', 'SGST @ 9%', this.calcualteGST(this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2))],
              ['','','', 'CGST @ 9%', this.calcualteGST(this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2))],
              [{colSpan: 3,border: [true, true, true, false],  text: 'Rupees in Words : '},'','', {border: [true, true, true, false], text:''} , {border: [true, true, true, false], text:''}],
              [{colSpan: 3,border: [true, false, true, true], italics: true, text: this.numberToWords(this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2)),},'','', {border: [true, false, true, false], bold: true, text:'Grand Total', fontSize:14} ,
               {border: [true, false, true, false], bold: true, fontSize:14, text:this.totalValue(this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2))}],
              [{colSpan: 3,border: [true, true, true, true], text: 'Transport Mode : BY ROAD      |        Place of Supply : SAME'},'','', {border: [true, false, true, true], text:''} , {border: [true, false, true, true], text:''}]

            ]
          }
        },
        {
          text: 'Additional Details',
          style: 'sectionHeader'
        },
        {
            text: 'Crack, band, Patch less measurement',
            margin: [0, 0 ,0, 15]
        },
        {
          columns: [
            [{ qr: `${this.invoice.customerName}`, fit: '50' }],
            [{ text: `For ${this.name}`, alignment: 'right', italics: true}],
          ]
        },
        {
          text: 'Terms and Conditions',
          style: 'sectionHeader'
        },
        {
            fontSize: 10,
            ul: [
              'Goods once sold cannot be taken back our responsibility ceases when goods leave from our place.',
              'We are not / responsible for damage, pilferage during transit.',
              'Goods return will be made within 10 dys from the date of purchase',
              'E & O.E.'
            ],
        },
        {
          margin: [0, 10, 0, 0],
          fontSize: 8 ,
          text: 'This is Computer Generated Bill, hence Signature is not required',
          italics: true
          // columns: [
          //   [{ text: 'This is Computer Generated Bill, hence Signature is not required', italics: true}],
          //   // [{ text: 'gk', alignment: 'right', italics: true}],
          // ]
        },
      ],
      styles: {
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 15,0, 15]
        }
      }
    };

    if(action==='download'){
      pdfMake.createPdf(docDefinition).download();
    }else if(action === 'print'){
      pdfMake.createPdf(docDefinition).print();
    }else{
      pdfMake.createPdf(docDefinition).open();
    }

  }

  addProduct(){
    this.invoice.products.push(new Product());
  }

  removeProduct(){
    this.invoice.products.pop();
  }

  calcualteGST(value){
    return (9/100 *value).toFixed(2);
  }

  numberToWords(value){
    value = this.totalValue(value);
    const toWords = new ToWords();
    return toWords.convert(value, {currency: true});
  }

  totalValue(value){
    let taxPercent = Math.round(18/100 *value).toFixed(2);
    this.totalVal = parseFloat(value)+parseFloat(taxPercent);
    return this.totalVal;
  }

  companySelect(){
    if(this.invoice.company === 'Reshmi Traders'){
      this.name = this.rashmiDetails.name;
      this.address = this.rashmiDetails.address;
      this.gst = this.rashmiDetails.gst;
      this.bank = this.rashmiDetails.bank;
      this.phone = this.rashmiDetails.phone;
    } else {
      this.name = this.arsDetails.name;
      this.address = this.arsDetails.address;
      this.gst = this.arsDetails.gst;
      this.bank = this.arsDetails.bank;
      this.phone = this.arsDetails.phone;
    }
  }

  formattedDate(){
    return formatDate(this.invoice.date, 'dd-MM-yyyy', 'en-Us');
  }

}
