import Link from 'next/link';
import { themeMaterial } from 'ag-grid-community';
import { colorSchemeLightCold } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useMemo, useState } from 'react';
import { createPricingEngine } from '../../lib/rulesEngine';
import { 
  instanceSurchargeRules,
  vramSurchargeRules,
  discSurchargeRules,
  regionSurchargeRules
} from '../../lib/ruleDefns';
import { initialData } from '../../lib/initialData';
import IntroModal from './introModal';

const myTheme = themeMaterial
  .withPart(colorSchemeLightCold)
  .withParams({
    headerBackgroundColor: '#cfcdd4',
    backgroundColor: '#f5f7f7',
    oddRowBackgroundColor: 'rgb(0, 0, 0, 0.03)'
  });

export default function Home() {
  const [rowData, setRowData] = useState(initialData);
  const [currentSurchargeRule, setCurrentSurchargeRule] = useState()
  const [currentSurchargeValue, setCurrentSurchargeValue] = useState()
  const pricingEngine = useMemo(() => createPricingEngine(), []);

  const colDefs = useMemo(() => [
      {
        headerName: 'Quantity',
        field: "quantity", 
        editable: true,
        valueParser: (params) => {
          const val = parseInt(params.newValue, 10);
          return isNaN(val) ? null : val;
        },
        cellClassRules: {
          'cell-error': (params) => {
            const value = params.value;
            return value < 1 || value > 100;
          }
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
        valueParser: (params) => {
          const val = parseInt(params.newValue, 10);
          return isNaN(val) ? null : val;
        },
        cellClassRules: {
          'cell-error': (params) => {
            const value = params.value;
            return value < 1 || value > 100;
          }
        }
      },
      { 
        headerName: 'Total',
        field: "total", 
        editable: false,
      }
  ], []);

  const calculatePrice = async (row, columnName) => {
    let quantity = parseInt(row.quantity)
    let margin = parseInt(row.margin)
    let instancesize = row.instancesize
    let vram = row.vram
    let disc = row.disc
    let region = row.region
    let price = 0.0

    const facts = {
      instancesize: instancesize,
      vram: vram,
      disc: disc,
      region: region
    }
    console.log(`calculatePrice() - ${JSON.stringify(facts)}`)
    const { events } = await pricingEngine.run(facts);
    console.log(`calculatePrice() events: - ${JSON.stringify(events)}`)

    for (let event of events) {
      if (event.type === 'instanceSurcharge') {
        price += event.params.surcharge;
        if(columnName == 'instancesize') {
          setCurrentSurchargeRule(event.type);
          setCurrentSurchargeValue(instancesize)
        }
      }
      if (event.type === 'vramSurcharge') {
        price += event.params.surcharge;
        if(columnName == 'vram') {
          setCurrentSurchargeRule(event.type);
          setCurrentSurchargeValue(vram)
        }
      }
      if (event.type === 'discSurcharge') {
        price += event.params.surcharge;
        if(columnName == 'disc') {
          setCurrentSurchargeRule(event.type);
          setCurrentSurchargeValue(disc)
        }
      }
      if (event.type === 'regionSurcharge') {
        price += event.params.surcharge;
        if(columnName == 'region') {
          setCurrentSurchargeRule(event.type);
          setCurrentSurchargeValue(region)
        }
      }
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

  const JsonDisplay = ({ data }) => {
    let json = '';
    if (data === 'instanceSurcharge') {
      json = instanceSurchargeRules.filter(obj => obj.conditions.any[0].value === currentSurchargeValue)
    } else if (data === 'vramSurcharge') {
      json = vramSurchargeRules.filter(obj => obj.conditions.any[0].value === currentSurchargeValue)
    } else if (data === 'discSurcharge') {
      json = discSurchargeRules.filter(obj => obj.conditions.any[0].value === currentSurchargeValue)
    } else if (data === 'regionSurcharge') {
      json = regionSurchargeRules.filter(obj => obj.conditions.any[0].value === currentSurchargeValue)
    }
    return (
      <div className="container pt-2 ">
        <h5>Last JSON Rule Applied</h5>
        <pre className="bg-dark text-white p-3 rounded"
        style={{
          height: '40vh',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          fontSize: '1rem',
        }}>
          <code>{JSON.stringify(json, null, 2)}</code>
        </pre>
      </div>
    );
  };

  const onCellValueChanged = async (params) => {
    const rowIndex = params.node.rowIndex;
    console.log(`onCellValueChanged() - rowIndex - ${JSON.stringify(rowIndex)}`)

    const columnName = params.column.getColDef().field;
    console.log(`onCellValueChanged() - columnName - ${JSON.stringify(columnName)}`)

    const updatedRow = { ...params.data };
    console.log(`onCellValueChanged() - ${JSON.stringify(updatedRow)}`)

    const { price, total } = await calculatePrice(updatedRow, columnName);
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
      <IntroModal />
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
      <div class="ag-theme-balham-dark" style={{ height: '40vh', width: '100vw' }}>
        <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            onCellValueChanged={onCellValueChanged}
            defaultColDef={{ flex: 1 }}
            theme={myTheme}
            style={{ borderBottom: '2px solid #ccc' }}
        />
      </div>
      <JsonDisplay data={currentSurchargeRule}/>
    </>
  );
}
