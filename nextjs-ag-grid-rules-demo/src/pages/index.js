import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";

import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import React, { useMemo, useState } from 'react';
import { createPricingEngine } from './rulesEngine';

const initialData = [
  {
    quantity: 1, 
    // instancesize: "t2.nano", 
    // vram: "16", 
    // disc: '10', 
    // region: 'us-east-1',
    price: 0.0
  },
  { 
    quantity: 1,
    // instancesize: "t2.nano", 
    // vram: "16", 
    // disc: '10', 
    // region: 'us-east-1',
    price: 0.0
  },
  { 
    quantity: 1,
    // instancesize: "t2.nano", 
    // vram: "16", 
    // disc: '10', 
    // region: 'us-east-1',
    price: 0.0
  },
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
        }
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
    const updatedRow = { ...params.data };
    const { price, total } = await calculatePrice(updatedRow);
    updatedRow.price = price
    updatedRow.total = total


    const updatedRows = rowData.map((r, i) =>
      i === params.node.rowIndex ? updatedRow : r
    );
    setRowData(updatedRows);
  };

  return (
    <div style={{ height: '35vh' }}>
    <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        onCellValueChanged={onCellValueChanged}
    />
  </div>

  );
}
