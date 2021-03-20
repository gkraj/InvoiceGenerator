import { Component } from '@angular/core';
import { ToWords } from 'to-words';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
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
  ewayBill: any;
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
    bank: 'RESHMI TRADERS \n TMB -A/c : 298150050800132 \n  Harur Branch \n IFC Code - TMBL0000298',
    address: 'MOOKKANURPATTI (VILL), Sandapatti-PO, Harur- TK, Dharmapuri-DT, Tamil Nadu',
    gst: '33BKVPS8439K1Z5'
  };
  arsDetails = {
    name : 'ARS TRADERS',
    bank: 'ARS TRADERS \n ICICI Bank -A/c : 283705500131 \n  Harur Branch \n IFC Code - ICIC0002837',
    address: 'GOBINATHAMPATTI KOOTU ROAD, Parayapatti Pudur - PO, Pappireddipatti - TK, Dharmapuri-DT, Tamil Nadu, PIN:636903',
    gst: '33AZUPA2010M1ZK'
  };
  totalVal;
  name;
  bank;
  address;
  gst;
  qr : any;

  lorryNumber = [
    {id:0, number: "TN 29 BS 2288"},
    {id:1, number: "TN 29 CX 2288"}
  ]

  companyName = [
    {id:0, name: 'Reshmi Traders'},
    {id:1, name: 'ARS Traders'}
  ]

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.qr = [];

  }


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
              { text: `Mobile: 94434 53798`, alignment: 'right', fontSize: 9},
              { text: `E-mail: southri@gmail.com`, alignment: 'right', fontSize: 9}
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
            [ { text: `Invoice No : ${this.invoice.number}`, alignment: 'left', fontSize: 10 } ],
            [ { text: 'State: TamilNadu, State Code: 33', alignment: 'center', fontSize: 10 } ],
            [ { text: `Date: ${this.invoice.date}`, alignment: 'right', fontSize: 10} ]
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
              ['Paticulars', 'HSN Code', 'Qty (Sq.Mtr)', 'Rate (Per.Sq.Mtr)', 'Amount'],
              ...this.invoice.products.map(p => ([p.name, p.hsnCode, p.qty, p.price, (p.price*p.qty).toFixed(2)])),
              [{colSpan:5, text: '_'},'','','',''],
              [{rowSpan: 3, colSpan: 3, text: `Bank Detail: ${this.bank}` } ,'','','Taxable Value', this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2)],
              ['','','', 'SGST @ 9%', this.calcualteGST(this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2))],
              ['','','', 'CGST @ 9%', this.calcualteGST(this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2))],
              // [{colSpan: 3, text: this.numberToWords(this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2))},'','', 'Grand Total', this.totalValue(this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2))],
              [{
                  colSpan: 3,
                  type: 'none',
                  text: [
                    'Rupees in Words :  \n ',
                    this.numberToWords(this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2)),
                    '\n Transport Mode : BY ROAD,               Place of Supply : SAME',
                  ],
                },'','', 'Grand Total', this.totalValue(this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2))
              ],

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
            type: 'none',
            fontSize: 12,
            ul: [
              'Goods once sold cannot be taken back our reesponsibility ceases wehn goads leave',
              'from our place. We are not / responsible for damage, pilferage during transit.',
              'Goods return will be made within 10 dys from the date of purchase',
              'E & O.E.'
            ],
        }
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

  calcualteGST(value){
    return (9/100 *value).toFixed(2);
  }

  numberToWords(value){
    value = this.totalValue(value);
    const toWords = new ToWords();
    console.log(toWords.convert(value, {currency: true}));
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
    } else {
      this.name = this.arsDetails.name;
      this.address = this.arsDetails.address;
      this.gst = this.arsDetails.gst;
      this.bank = this.arsDetails.bank;
    }
  }

  qrFnt(){
    this.qr.push(this.name, this.invoice.customerName, this.invoice.address, this.invoice.products, this.totalVal);
  }

}
