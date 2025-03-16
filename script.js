document.getElementById("risk-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get input values
    let age = parseInt(document.getElementById("age").value);
    let weight = parseFloat(document.getElementById("weight").value);
    let height = parseFloat(document.getElementById("height").value);
    let bloodPressure = parseFloat(document.getElementById("bloodPressure").value);

    // Validation
    if (isNaN(age) || age < 0) {
        alert("Please enter a valid age (0 or higher).");
        return;
    }
    if (isNaN(weight) || weight <= 0) {
        alert("Please enter a valid weight greater than 0.");
        return;
    }
    if (isNaN(height) || height <= 0 || !/^\d+(\.\d{1,2})?$/.test(height)) {
        alert("Please enter a valid height (e.g., 1.75). Max 2 decimal places.");
        return;
    }
    if (isNaN(bloodPressure) || bloodPressure < 0) {
        alert("Please enter a valid blood pressure reading.");
        return;
    }

    // Prepare data to send to backend
    const formData = {
        age,
        weight,
        height,
        bloodPressure,
        familyHistory: {
            diabetes: document.getElementById("diabetes").checked,
            cancer: document.getElementById("cancer").checked,
            alzheimers: document.getElementById("alzheimers").checked
        }
    };

    // Send data to backend
    fetch('http://healthriskcalculatorweb-bcangtchd4age4gg.uaenorth-01.azurewebsites.net/calculate-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("risk-score").innerHTML = `<strong>Risk Score:</strong> ${data.riskScore}`;
        document.getElementById("risk-category").innerHTML = `<strong>Category:</strong> ${data.riskCategory}`;
        document.getElementById("bmi-result").innerHTML = `<strong>BMI:</strong> ${data.bmi} (${data.bmiCategory}) <br> 
            <small>Formula: ${weight} kg ÷ (${height} m × ${height} m)</small>`;
        document.getElementById("bp-result").innerHTML = `<strong>Blood Pressure Category:</strong> ${data.bpCategory}`;

        // Display detailed risk breakdown
        let breakdownHTML = "<p><strong>Risk Breakdown:</strong></p><ul>";
        data.breakdown.forEach(item => {
            breakdownHTML += `<li>${item.factor}: +${item.points} points</li>`;
        });
        breakdownHTML += "</ul>";
        document.getElementById("risk-breakdown").innerHTML = breakdownHTML;

        document.getElementById("result").classList.remove("hidden");
        window.scrollTo({
            top: document.getElementById("result").offsetTop, // Scroll to the risk summary
            behavior: "smooth" // Smooth scroll effect
        });
    })
    
    .catch(error => {
        console.error('Error:', error);
        alert(`An error occurred: ${error.message}`);
    });
});
