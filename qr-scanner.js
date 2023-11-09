let scannerRunning = true;

function onScanSuccess(decodedText, decodedResult) {
  if (!scannerRunning) {
    return;
  }
  scannerRunning = false;

  // The 'decodedText' variable contains the user's ID from the QR code
  // Send a request to the server to add points to the user's account
  fetch(`/addPoints/${decodedText}`, {
    method: "PUT",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Stop scanning after a successful scan
      html5QrcodeScanner
        .stop()
        .then((ignore) => {
          console.log("Stopped scanning");
        })
        .catch((error) => {
          console.error("Error stopping scanner", error);
        });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

let html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  { fps: 10, qrbox: 250 },
  false
);
html5QrcodeScanner.render(onScanSuccess);
