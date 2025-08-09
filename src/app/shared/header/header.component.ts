import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// NOTA: Se eliminaron las importaciones de 'animate' de @angular/animations
// porque ahora manejaremos las animaciones con CSS para una mejor compatibilidad con SSR.

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  // Se eliminó por completo el array 'animations' para usar transiciones CSS.
})
export class HeaderComponent {

  // --- Propiedades de Estado (ahora simplificadas) ---

  // Estado del menú principal (hamburguesa)
  menuOpen = false;
  // Estado del menú de productos en móvil (acordeón)
  mobileProductsMenuOpen = false;
  // Estado de la categoría abierta en el acordeón de productos
  mobileCategoryOpenIndex: number | null = null;
  // Estado del mega menú de escritorio (para el efecto hover)
  megaMenuOpen = false;
  private megaMenuTimeout: any;

  // Estado visual controlado por el scroll
  isScrolled = false;
  showTopbar = true;

  // Contador del carrito (ejemplo, vendría de un servicio)
  cartItemCount: number = 3; // Puedes poner un número para probar el estilo.

  // Flag para saber si estamos en el navegador (clave para SSR)
  private isBrowser: boolean;

  // Tus categorías de productos (esto está perfecto)
  productCategories = [
    {
      title: 'Sopaipillas 🇨🇱',
      items: [
        { name: 'Formato Cóctel', link: '/productos/sopaipillas-coctel' },
        { name: 'Formato Grande', link: '/productos/sopaipillas-grandes' }
      ]
    },
    {
      title: 'Empanadas Crudas',
      items: [
        { name: 'Para Horno', link: '/productos/empanadas-horno' },
        { name: 'Para Freír', link: '/productos/empanadas-freir' }
      ]
    },
    {
      title: 'Masas Crudas',
      items: [
        { name: 'Discos para Empanada', link: '/productos/masas' }
      ]
    },
    {
      title: 'Otras Frituras',
      items: [
        { name: 'Calzones Rotos', link: '/productos/calzones-rotos' },
        { name: 'Arrollados y Chaparritas', link: '/productos/arrollados' },
        { name: 'Tequeños', link: '/productos/tequenos' }
      ]
    }
  ];
  // --- Constructor e Inyección de Dependencias ---

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Determinamos si el código se ejecuta en el navegador o en el servidor.
    // Esto previene errores de SSR al intentar acceder a 'window' o 'document'.
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // --- Listener de Eventos de la Ventana (Forma correcta en Angular) ---

  @HostListener('window:scroll')
  onWindowScroll() {
    // Solo ejecutamos esto en el navegador
    if (this.isBrowser) {
      const scrollY = window.scrollY;
      this.isScrolled = scrollY > 10;
      this.showTopbar = scrollY < 50;
    }
  }

  // --- Métodos de Interacción del Usuario ---

  /** Alterna la visibilidad del menú de navegación móvil principal. */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    // Si cerramos el menú, también cerramos los submenús.
    if (!this.menuOpen) {
      this.closeAllMobileMenus();
    }
  }
  
  /** Cierra el menú móvil (útil al hacer clic en un enlace). */
  closeMenu(): void {
    if (this.menuOpen) {
      this.menuOpen = false;
      this.closeAllMobileMenus();
    }
  }

  /** Alterna la visibilidad del submenú de productos en la vista móvil. */
  toggleMobileProductsMenu(): void {
    // En pantallas de escritorio, este click no debería hacer nada.
    // Lo controlamos con CSS ('pointer-events: none;' en el media query de escritorio).
    this.mobileProductsMenuOpen = !this.mobileProductsMenuOpen;
    // Si se cierra, también reseteamos las categorías internas.
    if (!this.mobileProductsMenuOpen) {
      this.mobileCategoryOpenIndex = null;
    }
  }

  /** Abre o cierra una categoría específica dentro del menú de productos móvil. */
  toggleMobileCategory(index: number, event: Event): void {
    event.stopPropagation(); // Evita que el click cierre el menú de productos.
    this.mobileCategoryOpenIndex = this.mobileCategoryOpenIndex === index ? null : index;
  }
  
  /** Método auxiliar para resetear el estado de los menús móviles. */
  private closeAllMobileMenus(): void {
    this.mobileProductsMenuOpen = false;
    this.mobileCategoryOpenIndex = null;
  }

  /** Muestra el mega menú en escritorio (para hover). */
  showMegaMenu(): void {
    clearTimeout(this.megaMenuTimeout);
    this.megaMenuOpen = true;
  }

  /** Oculta el mega menú en escritorio con un pequeño retardo (para hover). */
  hideMegaMenu(): void {
    this.megaMenuTimeout = setTimeout(() => {
      this.megaMenuOpen = false;
    }, 120);
  }
  
  /** Desplaza la ventana hacia la parte superior. */
  scrollToTop(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}