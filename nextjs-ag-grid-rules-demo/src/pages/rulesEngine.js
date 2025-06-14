import { Engine } from 'json-rules-engine';
import { 
  instanceSurchargeRules,
  vramSurchargeRules,
  discSurchargeRules,
  regionSurchargeRules
} from './ruleDefns';

export const createPricingEngine = () => {
    const engine = new Engine();

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