export const MENU_ITEM_SELECTOR = '[role^="menuitem"]';

export function isMenuItemEnabled(item) {
  return (
    !item.disabled &&
    !item.hasAttribute('disabled') &&
    item.getAttribute('aria-disabled') !== 'true'
  );
}

export function getMenuItems(menu) {
  return Array.from(menu.querySelectorAll(MENU_ITEM_SELECTOR)).filter(
    isMenuItemEnabled
  );
}

export function focusMenuItem(menu, item) {
  getMenuItems(menu).forEach((el) =>
    el.setAttribute('tabindex', el === item ? '0' : '-1')
  );
  item.focus();
}

export function toggleMenuItem(item, menu) {
  const role = item.getAttribute('role');

  if (role === 'menuitemcheckbox') {
    const checked = item.getAttribute('aria-checked') === 'true';
    item.setAttribute('aria-checked', String(!checked));
    return true;
  } else if (role === 'menuitemradio') {
    const group = item.closest('[role="group"]') ?? menu;
    group
      .querySelectorAll('[role="menuitemradio"]')
      .forEach((radio) =>
        radio.setAttribute('aria-checked', String(radio === item))
      );
    return true;
  }
  return false;
}

export function findMenuItemByChar(char, items, current) {
  if (items.length === 0) return null;
  const start = items.indexOf(current) + 1;
  const letter = char.toLocaleLowerCase();
  for (let i = 0; i < items.length; i++) {
    const item = items[(start + i) % items.length];
    if (item.textContent.trim().toLocaleLowerCase().startsWith(letter)) {
      return item;
    }
  }
  return null;
}
