import {
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  // --- Estado principal ---
  menuOpen = false;
  menuAnimating = false;                 // bloquea clicks durante la animación
  private animFallback: any = null;      // fallback por si no llega transitionend

  // Submenús mobile
  mobileProductsMenuOpen = false;
  mobileCategoryOpenIndex: number | null = null;

  // Mega menú desktop (hover)
  megaMenuOpen = false;
  private megaMenuTimeout: any;

  // Sin efectos por scroll (flags quedan por compatibilidad con el template)
  isScrolled = false;
  showTopbar = true;

  // Demo carrito
  cartItemCount = 3;

  // SSR
  private isBrowser: boolean;

  // Debe coincidir con la duración del transition (opacity) en .header-nav
  private readonly MENU_ANIM_MS = 300;

    productCategories = [
    {
      title: 'Sopaipillas 🇨🇱',
      items: [
        { name: 'Formato Cóctel', link: '/productos/sopaipillas-coctel' },
        { name: 'Formato Grande', link: '/productos/sopaipillas-grandes' },
      ],
    },
    {
      title: 'Empanadas Crudas',
      items: [
        { name: 'Para Horno', link: '/productos/empanadas-horno' },
        { name: 'Para Freír', link: '/productos/empanadas-freir' },
      ],
    },
    {
      title: 'Masas Crudas',
      items: [{ name: 'Discos para Empanada', link: '/productos/masas' }],
    },
    {
      title: 'Otras Frituras',
      items: [
        { name: 'Calzones Rotos', link: '/productos/calzones-rotos' },
        { name: 'Arrollados y Chaparritas', link: '/productos/arrollados' },
        { name: 'Tequeños', link: '/productos/tequenos' },
      ],
    },
  ];

  // ViewChild del panel (opcional para SSR)
  @ViewChild('navPanel', { static: false }) navPanel?: ElementRef<HTMLElement>;
  private unlistenNav?: () => void;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private renderer: Renderer2
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    // En SSR no hay DOM real
    if (!this.isBrowser) return;

    // Si existe el panel, escuchamos el fin de la transición de opacity
    if (this.navPanel?.nativeElement) {
      this.unlistenNav = this.renderer.listen(
        this.navPanel.nativeElement,
        'transitionend',
        (e: TransitionEvent) => {
          if (e.propertyName === 'opacity') {
            this.menuAnimating = false;
            if (this.animFallback) {
              clearTimeout(this.animFallback);
              this.animFallback = null;
            }
          }
        }
      );
    }
  }

  ngOnDestroy(): void {
    if (this.unlistenNav) this.unlistenNav();
    if (this.animFallback) clearTimeout(this.animFallback);
    if (this.megaMenuTimeout) clearTimeout(this.megaMenuTimeout);
  }

  /** Alterna la visibilidad del menú móvil (bloquea clicks durante animación). */
  toggleMenu(): void {
    if (this.menuAnimating) return; // ignora clicks repetidos
    this.menuAnimating = true;

    this.menuOpen = !this.menuOpen;

    if (!this.menuOpen) {
      this.closeAllMobileMenus();
    }

    // Fallback por si el navegador no dispara transitionend
    this.animFallback = setTimeout(
      () => (this.menuAnimating = false),
      this.MENU_ANIM_MS + 50
    );
  }

  /** Cierra el menú móvil (usado al hacer click en un enlace). */
  closeMenu(): void {
    if (!this.menuOpen || this.menuAnimating) return;
    this.menuAnimating = true;

    this.menuOpen = false;
    this.closeAllMobileMenus();

    this.animFallback = setTimeout(
      () => (this.menuAnimating = false),
      this.MENU_ANIM_MS + 50
    );
  }

  /** Alterna el submenú de productos en mobile. */
  toggleMobileProductsMenu(): void {
    this.mobileProductsMenuOpen = !this.mobileProductsMenuOpen;
    if (!this.mobileProductsMenuOpen) this.mobileCategoryOpenIndex = null;
  }

  /** Abre/cierra una categoría dentro del acordeón mobile. */
  toggleMobileCategory(index: number, event: Event): void {
    event.stopPropagation();
    this.mobileCategoryOpenIndex =
      this.mobileCategoryOpenIndex === index ? null : index;
  }

  /** Resetea estado de submenús mobile. */
  private closeAllMobileMenus(): void {
    this.mobileProductsMenuOpen = false;
    this.mobileCategoryOpenIndex = null;
  }

  /** Mostrar/ocultar mega menú (desktop, hover). */
  showMegaMenu(): void {
    clearTimeout(this.megaMenuTimeout);
    this.megaMenuOpen = true;
  }

  hideMegaMenu(): void {
    this.megaMenuTimeout = setTimeout(() => (this.megaMenuOpen = false), 120);
  }

  /** Scroll to top (independiente de estilos por scroll). */
  scrollToTop(): void {
    if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
