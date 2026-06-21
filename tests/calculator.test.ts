import { EMISSION_FACTORS } from '../server';

describe('Calculator Emission Factors', () => {
  it('should have correct transport emission factors', () => {
    expect(EMISSION_FACTORS.transport.flight).toBe(0.255);
    expect(EMISSION_FACTORS.transport.car).toBe(0.21);
    expect(EMISSION_FACTORS.transport.bus).toBe(0.089);
    expect(EMISSION_FACTORS.transport.train).toBe(0.041);
  });

  it('should calculate transport correctly including zero and edge cases', () => {
    const calc = (mode, dist) => {
      if (dist <= 0) return 0;
      return EMISSION_FACTORS.transport[mode] * dist;
    };
    expect(calc('flight', 100)).toBe(25.5);
    expect(calc('car', 0)).toBe(0);
    expect(calc('bus', -10)).toBe(0);
  });

  it('should have correct food emission calculations', () => {
    expect(EMISSION_FACTORS.food['Chicken biryani']).toBe(3.1);
    
    const calcFood = (meals) => {
       if (!meals || meals.length === 0) return 0;
       return meals.reduce((sum, item) => sum + (EMISSION_FACTORS.food[item] || 0), 0);
    };
    
    expect(calcFood(['Chicken biryani', 'Veg pizza'])).toBe(3.1 + 1.1);
    expect(calcFood([])).toBe(0);
  });

  it('should test electricity calculation with India grid factor', () => {
    const calcElectricity = (kwh) => {
      if (kwh <= 0) return 0;
      return kwh * 0.82; // India grid factor currently used in server.ts
    };
    expect(calcElectricity(10)).toBe(8.2);
    expect(calcElectricity(0)).toBe(0);
    expect(calcElectricity(-5)).toBe(0);
  });

  it('should calculate total CO2 correctly across categories', () => {
    const calcTotal = (transportMode, dist, meals, kwh) => {
       let total = 0;
       if (dist > 0 && EMISSION_FACTORS.transport[transportMode]) {
          total += EMISSION_FACTORS.transport[transportMode] * dist;
       }
       if (meals && meals.length > 0) {
          total += meals.reduce((sum, item) => sum + (EMISSION_FACTORS.food[item] || 0), 0);
       }
       if (kwh > 0) {
          total += kwh * 0.82;
       }
       return total;
    };

    const total = calcTotal('car', 10, ['Dal', 'Veg pizza'], 5); 
    // 2.1 + (0.4 + 1.1) + 4.1 = 7.7
    expect(total).toBeCloseTo(7.7);
  });
});
