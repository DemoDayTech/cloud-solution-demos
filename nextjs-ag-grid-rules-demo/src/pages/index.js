import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Link from 'next/link';
import { themeMaterial } from 'ag-grid-community';
import { colorSchemeDark, colorSchemeLightWarm, colorSchemeDarkWarm, colorSchemeLightCold } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import React, { useMemo, useState } from 'react';
import { createPricingEngine } from './rulesEngine';

// const myTheme = themeMaterial.withParams({
//   backgroundColor: 'rgb(249, 245, 227)',
//   foregroundColor: 'rgb(126, 46, 132)',
//   headerTextColor: 'rgb(204, 245, 172)',
//   headerBackgroundColor: 'rgb(136, 133, 143)',
//   oddRowBackgroundColor: 'rgb(0, 0, 0, 0.03)',
//   headerColumnResizeHandleColor: 'rgb(126, 46, 132)',
// });
const myTheme = themeMaterial
  .withPart(colorSchemeLightCold)
  .withParams({
    headerBackgroundColor: '#cfcdd4',
    backgroundColor: '#f5f7f7',
    oddRowBackgroundColor: 'rgb(0, 0, 0, 0.03)'
  }

  )
  ;


const initialData = [
  {
    quantity: 1, 
    price: 0.0
  },
  { 
    quantity: 1,
    price: 0.0
  },
  { 
    quantity: 1,
    price: 0.0
  },
  { 
    quantity: 1,
    price: 0.0
  },
  { 
    quantity: 1,
    price: 0.0
  },
  { 
    quantity: 1,
    price: 0.0
  },
  { 
    quantity: 1,
    price: 0.0
  },
  { 
    quantity: 1,
    price: 0.0
  },
  { 
    quantity: 1,
    price: 0.0
  },
  { 
    quantity: 1,
    price: 0.0
  },
  { 
    quantity: 1,
    price: 0.0
  },
  { 
    quantity: 1,
    price: 0.0
  },
  { 
    quantity: 1,
    price: 0.0
  },
  { 
    quantity: 1,
    price: 0.0
  }
];

export default function Home() {
  const [rowData, setRowData] = useState(initialData);
  const pricingEngine = useMemo(() => createPricingEngine(), []);

  const colDefs = useMemo(() => [
      {
        headerName: 'Quantity',
        field: "quantity", 
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: [1,2,3,4,5] 
        },
      },
      {
        headerName: 'Instance Size',
        field: "instancesize", 
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['t2.nano', 'm6g.large', 'm6g.8xlarge', 'm6gd.2xlarge'] 
        }
      },
      { 
        headerName: 'VRAM',
        field: "vram", 
        editable: true,
        type: 'numericColumn',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['16', '32', '48', '64'] 
        }
      },
      { 
        headerName: 'Disc Size (GB)',
        field: "disc", 
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['4', '8', '16', '32'] 
        }
      },
      { 
        headerName: 'Region',
        field: "region", 
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2'] 
        }
      },
      { 
        field: "price", 
        editable: false,
        // valueGetter: (params) => {
        //   const { data } = params;
        //   let instanceSizePrice = data.instancesize === 't2.nano' ? 1 : 2;
        //   let vRamPrice = data.vram === '16' ? 2 : 4;
        //   let discPrice = data.disc === '10' ? 1 : 2;
        //   let regionPrice = data.region === 'us-east-1' ? 3 : 1;
        //   let price = instanceSizePrice * vRamPrice * discPrice * regionPrice;
        //   if (data.margin) {
        //     price += 20;
        //   }
        //   if (data.quantity > 1) {
        //     price *= data.quantity;
        //   }     
        //   return price.toFixed(2);
        // }
      },
      { 
        headerName: 'Margin (%)',
        field: "margin", 
        editable: true,
      },
      { 
        headerName: 'Total',
        field: "total", 
        editable: false,
      }
  ], []);

  const calculatePrice = async (row) => {
    let quantity = parseInt(row.quantity)
    let margin = parseInt(row.margin)
    let instancesize = row.instancesize
    let vram = row.vram
    let disc = row.disc
    let region = row.region
    let price = 0.0

    const { events } = await pricingEngine.run({
      instancesize: instancesize,
      vram: vram,
      disc: disc,
      region: region
    });

    for (let event of events) {
      if (event.type === 'instanceSurcharge') price += event.params.surcharge;
      if (event.type === 'vramSurcharge') price += event.params.surcharge;
      if (event.type === 'discSurcharge') price += event.params.surcharge;
      if (event.type === 'regionSurcharge') price += event.params.surcharge;
    }

    // Multiply price by the quantity
    price *= quantity

    // Apply margin
    let total = price
    if(margin) {
      total = price + (price * margin/100.00)
    }

    return {
      price: parseFloat(price.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    }
    
    
  };

  const onCellValueChanged = async (params) => {
    const rowIndex = params.node.rowIndex;
    const updatedRow = { ...params.data };
    const { price, total } = await calculatePrice(updatedRow);
    updatedRow.price = price
    updatedRow.total = total

    const updatedRows = rowData.map((r, i) =>
      i === params.node.rowIndex ? updatedRow : r
    );
    setRowData(updatedRows);

    setTimeout(() => {
      params.api.flashCells({
        rowNodes: [params.node],
        columns: ['price', 'total'],
        flashDelay: 200,  // Wait before flashing
        fadeDelay: 1000   // Flash visible for 1 second
      });
    }, 50); // Delay can be adjusted (e.g., 50–100 ms)
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ height: '50px' }}>
        <div className="container-fluid">
          <Link href="/" className="navbar-brand">AG Grid with JSON Rules Engine Demo</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link href="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <Link href="/" className="nav-link">About</Link>
              </li>
              <li className="nav-item">
                <Link href="/" className="nav-link">Contact</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div class="jumbotron jumbotron-fluid" style={{ height: '100px', backgroundColor: '#e9ecef' }}>
        <div class="container">
          <p class="text-center align-items-center p-1" >This is a demo of a ReactJS web app, which uses AG Grid and a JSON Rules Engine to calculate prices based on selected values from the grid. </p>
          <p class="text-center align-items-center p-1" >The Price and Total columns will update automatically based on your selections in the table. </p>

       </div>
      </div>

    <div class="ag-theme-balham-dark" style={{ height: 'calc(100vh - 150px)', width: '100vw' }}>
      <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          onCellValueChanged={onCellValueChanged}
          defaultColDef={{ flex: 1 }}
          theme={myTheme}
      />
    </div>
    </>

  );
}
