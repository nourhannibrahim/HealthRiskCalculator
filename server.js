const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express(); // Initialize Express app
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper function to calculate BMI
function calculateBMI(weight, height) {
    return weight / (height * height);
}

// Helper function to calculate the risk score
function calculateRisk(age, bmi, bloodPressure, familyHistory) {
    let riskScore = 0;
    const breakdown = [];

    // Age scoring
    let agePoints = 0;
    if (age < 30) agePoints = 0;
    else if (age < 45) agePoints = 10;
    else if (age < 60) agePoints = 20;
    else agePoints = 30;
    riskScore += agePoints;
    breakdown.push({ factor: 'Age', points: agePoints });

    // BMI scoring
    let bmiCategory = "Normal weight";
    let bmiPoints = 0;
    if (bmi < 25) bmiCategory = "Normal weight";
    else if (bmi < 30) {
        bmiCategory = "Overweight";
        bmiPoints = 30;
    } else {
        bmiCategory = "Obese";
        bmiPoints = 75;
    }
    riskScore += bmiPoints;
    breakdown.push({ factor: 'BMI', points: bmiPoints });

    // Blood Pressure scoring
    let bpCategory = getBloodPressureCategory(bloodPressure);
    let bpPoints = 0;
    if (bloodPressure < 120) bpPoints = 0; // Normal
    else if (bloodPressure < 130) bpPoints = 15; // Elevated
    else if (bloodPressure < 140) bpPoints = 30; // Stage 1
    else if (bloodPressure < 180) bpPoints = 75; // Stage 2
    else bpPoints = 100; // Crisis
    riskScore += bpPoints;
    breakdown.push({ factor: 'Blood Pressure', points: bpPoints });

    // Family history scoring
    let familyHistoryPoints = 0;
    if (familyHistory.diabetes) familyHistoryPoints += 10;
    if (familyHistory.cancer) familyHistoryPoints += 10;
    if (familyHistory.alzheimers) familyHistoryPoints += 10;
    riskScore += familyHistoryPoints;
    if (familyHistoryPoints > 0) {
        breakdown.push({ factor: 'Family History', points: familyHistoryPoints });
    }

    return { riskScore, breakdown, bmiCategory, bpCategory };
}

// Route to calculate risk
app.post("/calculate-risk", (req, res) => {
    const { age, weight, height, bloodPressure, familyHistory } = req.body;

    if (!age || !weight || !height || !bloodPressure) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Calculate BMI
    const bmi = calculateBMI(weight, height);
    
    // Calculate the risk score and breakdown
    const { riskScore, breakdown, bmiCategory, bpCategory } = calculateRisk(age, bmi, bloodPressure, familyHistory);
    
    // Determine risk category
    let riskCategory = "Low risk";
    if (riskScore <= 50) riskCategory = "Moderate risk";
    else if (riskScore <= 75) riskCategory = "High risk";
    else riskCategory = "Uninsurable";

    // Send response
    res.json({
        riskScore,
        riskCategory,
        bmi: bmi.toFixed(2),
        bmiCategory,
        bpCategory,
        breakdown
    });
});

// Helper function to determine blood pressure category
function getBloodPressureCategory(bp) {
    if (bp < 120) return "Normal";
    else if (bp < 130) return "Elevated";
    else if (bp < 140) return "Stage 1";
    else if (bp < 180) return "Stage 2";
    return "Crisis";
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
