const dangerAlertClass =
  "p-4 text-red-700 bg-red-100 border-l-4 border-red-500";
const warningAlertClass =
  "p-4 text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500";

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
      <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
        <p>{alertMessage}</p>
      </div>
    </>
  );
}

export default Alert;
