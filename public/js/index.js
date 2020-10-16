const formatPrice = (price) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
  }).format(price);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
};

document.querySelectorAll(".price").forEach((node) => {
  node.textContent = formatPrice(node.textContent);
});

document.querySelectorAll(".date").forEach((node) => {
  node.textContent = formatDate(node.textContent);
});

const $cart = document.querySelector("#cart");

if ($cart) {
  $cart.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove")) {
      const id = e.target.dataset.id;
      const csrf = e.target.dataset.csrf;

      fetch("/cart/remove/" + id, {
        method: "delete",
        headers: {
          "X-XSRF-TOKEN": csrf,
        },
      })
        .then((res) => res.json())
        .then((cart) => {
          if (cart.courses.length) {
            const html = cart.courses
              .map((course) => {
                return `
                  <tr>
                    <td>${course.title}</td>
                    <td>${course.count}</td>
                    <td>
                      <button class="btn btn-small waves-effect waves-light remove" data-id="${course.id}">Remove</button>
                    </td>
                  </tr>
                `;
              })
              .join("");

            $cart.querySelector("tbody").innerHTML = html;
            $cart.querySelector(".price").textContent = formatPrice(cart.price);
          } else {
            $cart.innerHTML = "<p>Your cart is still empty!</p>";
          }
        });
    }
  });
}

M.Tabs.init(document.querySelectorAll(".tabs"));
