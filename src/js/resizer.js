const elt = document.getElementById('resizer');

let lastX;
const doResize = evt => {
    evt.stopPropagation();
    evt.preventDefault();
    elt.style.transform = 'translateX(' + evt.pageX + 'px)';
    lastX = evt.pageX;
}
const endResize = () => {
    elt.classList.remove('moving');
    document.getElementById('spec-viewer').style.width = lastX + 'px';
    document.getElementById('part-selector').style.width = document.body.clientWidth - lastX + 'px';
    document.body.onmousemove = document.body.onmouseup = document.body.onmouseleave = null;
}
const startResize = () => {
    elt.classList.add('moving');
    document.body.onmousemove = doResize;
    document.body.onmouseup = document.body.onmouseleave = endResize;
}

elt.addEventListener('mousedown', startResize);