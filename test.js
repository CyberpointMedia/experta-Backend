const axios = require("axios");
const crypto = require("crypto");

const baseUrl = "http://localhost:8080/api"; // Replace with your API base URL
const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjRlZjgzNDI2ODgwY2M3ZDdmMjA0ZjgiLCJlbWFpbCI6ImFqaXQxQGdtYWlsLmNvbSIsInBob25lTm8iOiI4Mjk5MTg4NzAwIiwicmVzZW5kQ291bnQiOjAsIm90cCI6bnVsbCwib3RwRXhwaXJ5IjpudWxsLCJibG9jayI6ZmFsc2UsImlzVmVyaWZpZWQiOnRydWUsImJhc2ljSW5mbyI6IjY2NGVmODM0MjY4ODBjYzdkN2YyMDRmNiIsImNyZWF0ZWRBdCI6IjIwMjQtMDUtMjNUMDg6MDM6MDAuNDM0WiIsInVwZGF0ZWRBdCI6IjIwMjQtMTAtMTlUMTc6NDE6MDMuMTUwWiIsIl9fdiI6NTEsInByaWNpbmciOiI2NjRlZjliNjI2ZGMyZGU1M2E3Zjg2YWUiLCJleHBlcnRpc2UiOiI2NjYyYThkZTdhY2NiNTA0MmQwODc1N2MiLCJpbmR1c3RyeU9jY3VwYXRpb24iOiI2NjY1MzZhMjdhY2NiNTA0MmRjYTg3NjAiLCJlZHVjYXRpb24iOlsiNjY2OTBkNWY5YjhjZDEwMTJlYmI2ODA4IiwiNjY2YzM0Y2U4MWFmZThmYzZiNDY4OTQ5IiwiNjY3MTY2MDU4MWFmZThmYzZiNDY4YjFhIl0sIndvcmtFeHBlcmllbmNlIjpbIjY2NmFhOGI5ODFhZmU4ZmM2YjQ2ODYwOSIsIjY2NmFlOTA3ODFhZmU4ZmM2YjQ2ODc2MCIsIjY2NmFlOWZlODFhZmU4ZmM2YjQ2ODc2NSIsIjY2NmJlMjIxODFhZmU4ZmM2YjQ2ODdhYSIsIjY2NmJlMjJmODFhZmU4ZmM2YjQ2ODdhZiIsIjY2NmJlMzY2ODFhZmU4ZmM2YjQ2ODdjZSJdLCJsYW5ndWFnZSI6IjY2MjlmODQ0ZWVlODUwMzA3Y2RjMmUxMyIsImludGVyZXNldCI6IjY2NzQxN2UwN2FjY2I1MDQyZDBlODhhMSIsImF2YWlsYWJpbGl0eSI6WyI2NjdjNzIwZDdkZDRmMjI4NGIwMzhjNTIiLCI2NjdjNzVhNDdmMjU4OTNlYmM2MzA1MTQiLCI2NjdkMTA3YzdmMjU4OTNlYmM2MzA1MmIiLCI2NjdkMTA5MzdmMjU4OTNlYmM2MzA1MzAiLCI2NjdkMzAxMDdmMjU4OTNlYmM2MzA1ODIiLCI2NjdlYWY3NTdmMjU4OTNlYmM2MzA2MmMiLCI2NjdlYWY4YTdmMjU4OTNlYmM2MzA2MzEiLCI2NjdlYjI3OTdmMjU4OTNlYmM2MzA2NjciXSwib25saW5lIjpmYWxzZSwibm9PZkJvb2tpbmciOjMsImJsb2NrZWRVc2VycyI6W10sInByb2ZpbGVDb21wbGV0aW9uUGVyY2VudGFnZSI6MTIsIm5vdGlmaWNhdGlvbnMiOlsiNjZiNzBhNjIzNGQ5MjlmNGY0ZmM5ZGJlIiwiNjZiNzBhNmEzNGQ5MjlmNGY0ZmM5ZGQwIiwiNjZiNzBiMDkzNGQ5MjlmNGY0ZmM5ZTFjIiwiNjZiNzEwMmMzNGQ5MjlmNGY0ZmM5ZTVmIiwiNjZiNzEwNjQzNGQ5MjlmNGY0ZmM5ZTgzIiwiNjZiNzEwNmEzNGQ5MjlmNGY0ZmM5ZTk1IiwiNjZiNzExNjg3OTdhZmNhYmY5NTJhYzUyIiwiNjZiNzIxYzFmZjRlYTM0Mzc5MzBhZDQ4IiwiNjZiNzIxZWRmZjRlYTM0Mzc5MzBhZDc2IiwiNjZiNzIxZjhmZjRlYTM0Mzc5MzBhZDkwIiwiNjZiNzIyNjlmZjRlYTM0Mzc5MzBhZGRhIiwiNjZiNzIyNzRmZjRlYTM0Mzc5MzBhZGVjIiwiNjZiNzIyODdmZjRlYTM0Mzc5MzBhZGZlIiwiNjZjYzBlNDk3NDJmZjYyMjc2NjQ0NTg3IiwiNjZjYzBlNTc3NDJmZjYyMjc2NjQ0NTk5IiwiNjZjYzBlNmI3NDJmZjYyMjc2NjQ0NWFiIiwiNjZjZTNiM2EwNTJjYzhmOTg5YjNlOTg5Il0sImlhdCI6MTcyOTM1OTY2MywiZXhwIjoxNzI5OTY0NDYzfQ.oFc18dNefcqREWfDcNkpm4g2wZPWLy4nR2O0HJ1hJzI"; // Replace with a valid auth token

// Razorpay key secret (for testing purposes only)
const razorpayKeySecret = "gidRJSWeHNjJAw7xitXPCFfj";

async function testRazorpayFlow() {
  try {
    // Step 1: Create Razorpay order (Add Coins)
    const addCoinsResponse = await axios.post(
      `${baseUrl}/add-coins`,
      { amount: 500 },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log("Add Coins Response:", addCoinsResponse.data);

    const { order, transactionId } = addCoinsResponse.data.data;

    // Step 2: Simulate successful payment
    // In a real scenario, this would be handled by Razorpay's frontend SDK
    const razorpay_order_id = order.id;
    const razorpay_payment_id =
      "pay_" + Math.random().toString(36).substr(2, 9);

    // Step 3: Generate signature for payment verification
    const payload = razorpay_order_id + "|" + razorpay_payment_id;
    const razorpay_signature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(payload)
      .digest("hex");

    // Step 4: Verify payment
    const verifyPaymentResponse = await axios.post(
      `${baseUrl}/verify-payment`,
      {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log("Verify Payment Response:", verifyPaymentResponse.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

testRazorpayFlow();
