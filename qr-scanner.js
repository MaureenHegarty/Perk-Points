window.onload = function () {
  // Define a global variable to store the code
  let qrCode;

  // Initialize the QR code scanner
  let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: 250 },
    false
  );

  function onScanSuccess(decodedText, decodedResult) {
    // Stop scanning
    html5QrcodeScanner.clear();

    // Display the code
    console.log("QR code: " + decodedText);

    // Store the code in the global variable
    qrCode = decodedText;
  }

  html5QrcodeScanner.render(onScanSuccess);

  // Define a function to add points
  function addPoints() {
    // Get the user ID from the QR code
    const userId = qrCode;

    // Send a request to the server to add points
    fetch(`/addPoints/${userId}`, {
      method: "PUT",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        document.getElementById("points").innerHTML =
          "Points: " + data.user.points;
        document.getElementById("user-name").innerHTML =
          "Name: " + data.user.first_name + data.user.last_name;
        document.getElementById("user-email").innerHTML =
          "Email: " + data.user.email;
        document.getElementById("user-points").innerHTML =
          "Perk Points: " + data.user.points;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Attach the addPoints function to a button click event
  document
    .getElementById("add-points-button")
    .addEventListener("click", addPoints);

  // Define a function to redeem the points
  function redeemPoints() {
    // Get the user ID from the QR code
    const userId = qrCode;

    // Send a request to the server to redeem points
    fetch(`/redeemPoints/${userId}`, {
      method: "PUT",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        document.getElementById("points").innerHTML =
          "Points: " + data.user.points;
        document.getElementById("user-name").innerHTML =
          "Name: " + data.user.first_name + data.user.last_name;
        document.getElementById("user-email").innerHTML =
          "Email: " + data.user.email;
        document.getElementById("user-points").innerHTML =
          "Perk Points: " + data.user.points;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Attach the redeemPoints function to a button click event
  document
    .getElementById("redeem-button")
    .addEventListener("click", redeemPoints);
};
