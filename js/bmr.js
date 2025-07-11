class BMRCalculator {
    constructor(gender, age, weight, height, activityLevel) {
        this.gender = gender;
        this.age = age;
        this.weight = weight;
        this.height = height;
        this.activityLevel = activityLevel;
    }

    calculate() {
        let bmr;
        if (this.gender === 'male') {
            bmr = 88.362 + (13.397 * this.weight) + (4.799 * this.height) - (5.677 * this.age);
        } else {
            bmr = 447.593 + (9.247 * this.weight) + (3.098 * this.height) - (4.330 * this.age);
        }

        const dailyCalories = bmr * this.activityLevel;
        return {
            bmr: Math.round(bmr),
            dailyCalories: Math.round(dailyCalories)
        };
    }
} 