const dangerAlertClass =
  "p-4 text-red-700 bg-red-100 border-l-4 border-red-500";
const warningAlertClass =
  "p-4 text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500";

/**
 * Alert component to display different types of alert messages.
 * 
 * @param {Object} props - The properties object.
 * @param {Object} props.alert - The alert object.
 * @param {string} props.alert.alertType - The type of the alert ('danger' or 'warning').
 * @param {string} props.alert.alertTitle - The title of the alert.
 * @param {string} props.alert.alertMessage - The message of the alert.
 */
function Alert({ alert }) {
  const { alertType, alertTitle, alertMessage } = alert;
  return (
    <>
      <div
        role="alert"
        className={
          alertType === "danger" ? dangerAlertClass : warningAlertClass
        }
      >
        {alertTitle}
      </div>
      <div
        className={
          alertType === "danger"
            ? "border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700"
            : "border border-t-0 border-yellow-400 rounded-b bg-yellow-100 px-4 py-3 text-yellow-700"
        }
      >
        <p>{alertMessage}</p>
      </div>
    </>
  );
}

export default Alert;
