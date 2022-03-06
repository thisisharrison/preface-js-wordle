document.addEventListener("DOMContentLoaded", () => {
    const template = `<div class="container-fluid"> <a class="navbar-brand" href="."> <img src="/src/assets/preface_logo.svg" alt="" width="30" height="24" /> </a> <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" > <span class="navbar-toggler-icon"></span> </button> <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel" > <div class="offcanvas-header"> <h5 class="offcanvas-title" id="offcanvasNavbarLabel"> Preface Wordle </h5> <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" ></button> </div> <div class="offcanvas-body"> <ul class="navbar-nav justify-content-end flex-grow-1 pe-3"> <li class="nav-item dropdown"> <a class="nav-link dropdown-toggle" href="#" id="offcanvasNavbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" > Students </a> <ul class="dropdown-menu" aria-labelledby="offcanvasNavbarDropdown" > <li> <a class="dropdown-item" href="/students/index.html" >Ellen</a > </li> <li> <a class="dropdown-item" href="/students/index.html" >Mark</a > </li> <li> <a class="dropdown-item" href="/students/index.html" >Kevin</a > </li> </ul> </li> </ul> </div> </div> </div> `;

    const navBar = document.createElement("nav");
    navBar.classList.add("navbar", "navbar-light", "fixed-top");
    navBar.innerHTML = template;
    const app = document.querySelector("#app");
    document.body.insertBefore(navBar, app!);
});
