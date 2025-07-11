class BMICalculator {
    constructor(weight, height) {
        this.weight = weight;
        this.height = height / 100; // cm to m
    }

    calculate() {
        const bmi = this.weight / (this.height * this.height);
        let category;

        if (bmi < 18.5) category = 'Zayıf';
        else if (bmi < 25) category = 'Normal';
        else if (bmi < 30) category = 'Kilolu';
        else category = 'Obez';

        return {
            bmi: bmi.toFixed(1),
            category: category
        };
    }
} 