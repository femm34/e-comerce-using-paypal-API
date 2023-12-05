async function main() {
  const result = await fetch(
    "https://fakestoreapi.com/products/category/electronics"
  );
  const data = await result.json();
  const mainDiv = document.querySelector("#listProducts");
  const div = document.createElement("div");
  div.className = "row";
  let item = ``;

  data.forEach((i) => {
    item += `<div class='col-12 col-md-3 col-sm-10 p-3'>
        <div class='card'>
          <div class="card-title">
            <img src="${i.image}" class="img-fluid" />
          </div>
          <div class="card-body">${i.title}</div>
          <div class="card-footer">
            <div>${i.price} $usd</div>
            <form action="/create" method="POST">
              <input type="hidden" name="price" value="${i.price}">
              <input type="hidden" name="name" value="${i.title}">
              <button class="btn btn-sm btn-primary">Pay with Paypal</button>
            </form>
          </div>
        </div>
      </div>`;
  });

  div.innerHTML = item;
  mainDiv.appendChild(div);
}

main();
