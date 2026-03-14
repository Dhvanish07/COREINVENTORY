export const makeReference = (type) => {
  const map = {
    receipt: "RCV",
    delivery: "DLV",
    transfer: "TRF",
    adjustment: "ADJ"
  };

  const prefix = map[type] || "DOC";
  const unique = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${unique}-${rand}`;
};