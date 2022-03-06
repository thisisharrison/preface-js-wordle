import { STUDENTS } from "./constants";

document.addEventListener("DOMContentLoaded", () => {
    const createStudentLi = (name: string, path: string) => `<li> <a class="dropdown-item" href="${path}" >${name}</a > </li>`;

    const allStudents = Object.entries(STUDENTS).reduce((acc, curr) => {
        const [name, path] = curr;
        acc += createStudentLi(name, path);
        return acc;
    }, "");

    const template = `<button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" > <span class="navbar-toggler-icon"></span> </button> <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel" > <div class="offcanvas-header"> <h5 class="offcanvas-title" id="offcanvasNavbarLabel"> Preface Wordle </h5> <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" ></button> </div> <div class="offcanvas-body"> <ul class="navbar-nav justify-content-end flex-grow-1 pe-3"> <li class="nav-item dropdown"> <a class="nav-link dropdown-toggle" href="#" id="offcanvasNavbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" > Students </a> <ul class="dropdown-menu" aria-labelledby="offcanvasNavbarDropdown" > ${allStudents} </ul> </li> </ul> </div> </div> </div>`;

    const navBar = document.querySelector("#nav-container-right");
    navBar!.innerHTML += template;
});
