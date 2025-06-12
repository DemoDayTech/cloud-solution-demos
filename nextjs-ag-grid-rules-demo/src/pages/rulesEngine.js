import { Engine } from 'json-rules-engine';

export const createPricingEngine = () => {
    const engine = new Engine();

    let instanceSurchargeRules = [
      {
        conditions: {
          any: [
            { 
              fact: 'instancesize', 
              operator: 'equal', 
              value: 't2.nano' 
            }
          ]
        },
        event: {
          type: 'instanceSurcharge', 
          params: { 
            surcharge: 10.00 
          } 
        }
      },
      {
        conditions: {
          any: [
            { 
              fact: 'instancesize', 
              operator: 'equal', 
              value: 'm6g.large' 
            }
          ]
        },
        event: {
          type: 'instanceSurcharge', 
          params: { 
            surcharge: 200.00
          } 
        }
      },
      {
        conditions: {
          any: [
            { 
              fact: 'instancesize', 
              operator: 'equal', 
              value: 'm6g.8xlarge' 
            }
          ]
        },
        event: {
          type: 'instanceSurcharge', 
          params: { 
            surcharge: 400.00
          } 
        }
      },
      {
        conditions: {
          any: [
            { 
              fact: 'instancesize', 
              operator: 'equal', 
              value: 'm6gd.2xlarge' 
            }
          ]
        },
        event: {
          type: 'instanceSurcharge', 
          params: { 
            surcharge: 1000.00
          } 
        }
      }
    ]

    let vramSurchargeRules = [
      {
        conditions: {
          any: [
            { 
              fact: 'vram', 
              operator: 'equal', 
              value: '16'
            }
          ]
        },
        event: {
          type: 'vramSurcharge', 
          params: { 
            surcharge: 100.00
          } 
        }
      },
      {
        conditions: {
          any: [
            { 
              fact: 'vram', 
              operator: 'equal', 
              value: '32'
            }
          ]
        },
        event: {
          type: 'vramSurcharge', 
          params: { 
            surcharge: 200.00 
          } 
        }
      },
      {
        conditions: {
          any: [
            { 
              fact: 'vram', 
              operator: 'equal', 
              value: '48'
            }
          ]
        },
        event: {
          type: 'vramSurcharge', 
          params: { 
            surcharge: 300.00
          } 
        }
      },
      {
        conditions: {
          any: [
            { 
              fact: 'vram', 
              operator: 'equal', 
              value: '64'
            }
          ]
        },
        event: {
          type: 'vramSurcharge', 
          params: { 
            surcharge: 400.00
          } 
        }
      }
    ]

    let discSurchargeRules = [
      {
        conditions: {
          any: [
            { 
              fact: 'disc', 
              operator: 'equal', 
              value: '4'
            }
          ]
        },
        event: {
          type: 'discSurcharge', 
          params: { 
            surcharge: 100.00
          } 
        }
      },
      {
        conditions: {
          any: [
            { 
              fact: 'disc', 
              operator: 'equal', 
              value: '8'
            }
          ]
        },
        event: {
          type: 'discSurcharge', 
          params: { 
            surcharge: 200.00 
          } 
        }
      },
      {
        conditions: {
          any: [
            { 
              fact: 'disc', 
              operator: 'equal', 
              value: '16'
            }
          ]
        },
        event: {
          type: 'discSurcharge', 
          params: { 
            surcharge: 300.00
          } 
        }
      },
      {
        conditions: {
          any: [
            { 
              fact: 'disc', 
              operator: 'equal', 
              value: '32'
            }
          ]
        },
        event: {
          type: 'discSurcharge', 
          params: { 
            surcharge: 400.00
          } 
        }
      }
    ]

    let regionSurchargeRules = [
      {
        conditions: {
          any: [
            { 
              fact: 'region', 
              operator: 'equal', 
              value: 'us-east-1'
            }
          ]
        },
        event: {
          type: 'regionSurcharge', 
          params: { 
            surcharge: 500.00
          } 
        }
      },
      {
        conditions: {
          any: [
            { 
              fact: 'region', 
              operator: 'equal', 
              value: 'us-east-2'
            }
          ]
        },
        event: {
          type: 'regionSurcharge', 
          params: { 
            surcharge: 400.00 
          } 
        }
      },
      {
        conditions: {
          any: [
            { 
              fact: 'region', 
              operator: 'equal', 
              value: 'us-west-1'
            }
          ]
        },
        event: {
          type: 'regionSurcharge', 
          params: { 
            surcharge: 300.00
          } 
        }
      },
      {
        conditions: {
          any: [
            { 
              fact: 'region', 
              operator: 'equal', 
              value: 'us-west-2'
            }
          ]
        },
        event: {
          type: 'regionSurcharge', 
          params: { 
            surcharge: 200.00
          } 
        }
      }
    ]

    instanceSurchargeRules.forEach((r) => {
      engine.addRule(r);
    })

    vramSurchargeRules.forEach((r) => {
      engine.addRule(r);
    })

    discSurchargeRules.forEach((r) => {
      engine.addRule(r);
    })

    regionSurchargeRules.forEach((r) => {
      engine.addRule(r);
    })

    return engine;
  };