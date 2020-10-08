document.querySelectorAll(".price").forEach((node) => {
  node.textContent = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
  }).format(node.textContent);
});
