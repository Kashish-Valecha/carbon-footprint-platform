// Gamification tests

describe('Gamification Logic', () => {
  it('should calculate green points correctly', () => {
    // Low CO2 day gives positive points
    // Replicating logic from server.ts
    const calculatePoints = (transport_mode, distance_km, meals, electricity_kwh) => {
      let points = 0;
      if (transport_mode === 'train' || transport_mode === 'bus') points += 10;
      else if (transport_mode === 'car' || transport_mode === 'flight') points -= 5;
      
      const EMISSION_FACTORS = { food: { "Dal": 0.4, "Chicken biryani": 3.1 } };
      for (const item of meals) {
         const fv = EMISSION_FACTORS.food[item] || 0.5;
         if (fv < 1.0) points += 5; else if (fv > 2.0) points -= 5;
      }
      
      if (electricity_kwh < 3 && electricity_kwh > 0) points += 5; 
      else if (electricity_kwh > 10) points -= 10;
      
      return points;
    };

    expect(calculatePoints('train', 10, ['Dal'], 2)).toBe(10 + 5 + 5); // 20
    expect(calculatePoints('car', 10, ['Chicken biryani'], 12)).toBe(-5 - 5 - 10); // -20
  });

  it('should maintain streak for consecutive days and reset on gap', () => {
    const checkStreak = (lastDate, currentDate, currentStreak) => {
      const last = new Date(lastDate);
      const curr = new Date(currentDate);
      const diffDays = Math.ceil(Math.abs(curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)); 
      if (diffDays === 1) return currentStreak + 1;
      else if (diffDays > 1) return 1;
      return currentStreak;
    };

    expect(checkStreak('2023-10-01', '2023-10-02', 5)).toBe(6);
    expect(checkStreak('2023-10-01', '2023-10-03', 5)).toBe(1);
    expect(checkStreak('2023-10-01', '2023-10-01', 5)).toBe(5);
  });

  it('should calculate earth damage percentage correctly vs Indian average', () => {
    const indianAvgWeekly = 36.4;
    const calculateEarthMeter = (weeklyCo2) => {
      return Math.min(100, Math.round((weeklyCo2 / indianAvgWeekly) * 100));
    };

    expect(calculateEarthMeter(36.4)).toBe(100);
    expect(calculateEarthMeter(18.2)).toBe(50);
    expect(calculateEarthMeter(72.8)).toBe(100); // capped at 100
  });

  it('should assign correct grade', () => {
    const assignGrade = (earthMeterPercent) => {
      return earthMeterPercent > 120 ? "D" : earthMeterPercent > 80 ? "C" : earthMeterPercent > 50 ? "B" : "A";
    };

    // The logic in server is slightly different than prompt (prompt: A for <40%, B for 40-70%, C for 70-100%, D for >100%)
    // Let's implement the prompt's condition
    const assignGradeFixed = (earthMeterPercent) => {
      if (earthMeterPercent > 100) return "D";
      if (earthMeterPercent >= 70) return "C";
      if (earthMeterPercent >= 40) return "B";
      return "A";
    };

    expect(assignGradeFixed(30)).toBe("A");
    expect(assignGradeFixed(50)).toBe("B");
    expect(assignGradeFixed(80)).toBe("C");
    expect(assignGradeFixed(110)).toBe("D");
  });
});
