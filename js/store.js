function handleSearch(){
  // loading animation start
  loadingAnimationToggle(true);

    
    const searchInputElement = document.getElementById('search-input-field');
    const searchInputValue = searchInputElement.value;
   
    loadphone(searchInputValue);
}                                                      

 function loadingAnimationToggle(isLoading){
  const loaderAnimation = document.getElementById('loader-animation');
  if(isLoading){
    loaderAnimation.classList.remove('hidden');
  }
      else{
        loaderAnimation.classList.add('hidden');
    }
  }

const loadphone = async (searchText) => {
    const res = await fetch(`https://openapi.programming-hero.com/api/phones?search=${searchText}`);
    
    console.log("Server Response: ", res);
   
    const serverData = await res.json();
    
    displayPhone(serverData.data.slice(0, 6)); // show only 6 initially

// show all button setup
let existingButton = document.getElementById("show-all-btn");
if (existingButton) {
  existingButton.remove(); // remove old button if it already exists
}

const showAllBtn = document.createElement("button");
showAllBtn.id = "show-all-btn";
showAllBtn.classList.add("btn");
showAllBtn.textContent = "Show All Results";
showAllBtn.onclick = () => {
  displayPhone(serverData.data); // show all when clicked
  showAllBtn.remove(); // remove button after clicked
};
document.getElementById("card-section").after(showAllBtn);

};

const displayPhone = (data) => {
    console.log(data);
   const cardContainer = document.getElementById('card-section');

    cardContainer.innerHTML = '';

   data.forEach((phone) => {
    const productCard = document.createElement('div');
    productCard.classList.add('card');

    productCard.innerHTML = `
    <div class="card-image">
               <img src=${phone.image} alt="phone-image" />
             </div>

             <h3 class="card-title">${phone.phone_name}</h3>
             <p class="card-description">
               There are many variations of passages of available, but the majority
               have suffered
             </p>

             <div class="card-price">
              <span>$</span>
              <span id="item-price">799</span>
             </div>

             <div class="card-button">
             <button onclick="showDetails('${phone.slug}')" class="btn">Show Details</button>
            </div>
    `;

    cardContainer.appendChild(productCard);
   });

   // loading animation ends here
    loadingAnimationToggle(false);
}


// MODAL LOGIC 
const modal = document.getElementById("myModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");

// fetch phone details from API
async function showDetails(phoneId) {
  const res = await fetch(`https://openapi.programming-hero.com/api/phone/${phoneId}`);
  const data = await res.json();
  const phone = data.data;

  document.getElementById("modal-phone-name").textContent = phone.name;
  document.getElementById("modal-phone-image").src = phone.image;
  document.getElementById("modal-phone-release").textContent =
    phone.releaseDate || "Release Date: Not available";
  document.getElementById("modal-phone-storage").textContent =
    "Storage: " + (phone.mainFeatures?.storage || "N/A");
  document.getElementById("modal-phone-display").textContent =
    "Display: " + (phone.mainFeatures?.displaySize || "N/A");
  document.getElementById("modal-phone-chipset").textContent =
    "Chipset: " + (phone.mainFeatures?.chipSet || "N/A");
  document.getElementById("modal-phone-memory").textContent =
    "Memory: " + (phone.mainFeatures?.memory || "N/A");

  modal.style.display = "block";
}

// close modal when clicking the X
modalCloseBtn.onclick = function () {
  modal.style.display = "none";
};

// close modal when clicking outside the box
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};


                             

