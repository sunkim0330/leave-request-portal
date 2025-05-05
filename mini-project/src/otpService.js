import { collection, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { send } from "@emailjs/browser";
import { db } from "./firebase";

function generateOtp(length = 6) {
  return Math.floor(
    10 ** (length - 1) + Math.random() * (10 ** length - 10 ** (length - 1) - 1)
  ).toString();
}

export const sendOtpEmail = async (employeeId) => {
  const empRef = doc(collection(db, "employees"), employeeId);
  const empDoc = await getDoc(empRef);
  if (!empDoc.exists()) {
    throw new Error("Employee not found");
  }

  const { email, name } = empDoc.data();

  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  await setDoc(doc(collection(db, "otps"), otp), {
    employeeId,
    otp,
    email,
    expiresAt,
  });

  await send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      to_email: email,
      to_name: name,
      passcode: otp,
      time: new Date(expiresAt).toLocaleString(),
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );
};

export const validateOtp = async ({ employeeId, otpInput }) => {
  const otpRef = doc(collection(db, "otps"), otpInput);
  const otpDoc = await getDoc(otpRef);
  if (!otpDoc.exists()) {
    return { success: false, message: "Invalid Passcode" };
  }

  const { employeeId: storedEmployeeId, expiresAt } = otpDoc.data();
  if (employeeId !== storedEmployeeId) {
    return { success: false, message: "Invalid Passcode. Please try again." };
  }

  const now = Date.now();
  if (now > expiresAt) {
    await deleteDoc(otpRef);
    return {
      success: false,
      message: "Passcode expired. Please request a new passcode.",
    };
  }

  await deleteDoc(otpRef);
  return { success: true };
};
