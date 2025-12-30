// src/components/Header.jsx
import { useState } from 'react'
import GlobalSearch from './GlobalSearch'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="flex border-b border-gray-300 py-3 px-4 sm:px-10 bg-white min-h-[65px] tracking-wide relative z-50">
      <div className="flex flex-wrap items-center gap-4 max-w-screen-xl mx-auto w-full">
        {/* logo desktop */}
        <a href="/" className="max-sm:hidden">
          <img src="/logos/logo_salterio_color.svg" alt="logo" className="w-[100px]" />
        </a>
        {/* logo mobile */}
        <a href="/" className="hidden max-sm:block">
          <img src="/logos/logo_salterio_color.svg" alt="logo" className="w-15" />
        </a>


        {/* MENÚ */}
        <div
          className={`${open ? '' : 'max-lg:hidden'
            } lg:!block max-lg:w-full max-lg:fixed max-lg:before:fixed max-lg:before:bg-black max-lg:before:opacity-50 max-lg:before:inset-0 max-lg:before:z-50`}
        >
          {/* botón Cerrar */}
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden fixed top-2 right-4 z-[100] rounded-full bg-white w-9 h-9 flex items-center justify-center border border-gray-200"
            aria-label="Cerrar menú"
          >
            <svg className="w-3.5 h-3.5 fill-slate-900" viewBox="0 0 320.591 320.591">
              <path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z" />
              <path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z" />
            </svg>
          </button>

          <ul className="lg:flex lg:ml-14 lg:gap-x-5 max-lg:space-y-3 max-lg:fixed max-lg:bg-white max-lg:w-1/2 max-lg:min-w-[300px] max-lg:top-0 max-lg:left-0 max-lg:p-6 max-lg:h-full max-lg:shadow-md max-lg:overflow-auto z-50">
            {/* logo solo visible en menú móvil */}
            <li className="mb-6 hidden max-lg:block">
              <a href="/">
                <img src="/logos/logo_salterio_color.svg" alt="logo" className="w-36" />
              </a>
            </li>

            <li className="max-lg:border-b max-lg:border-gray-300 max-lg:py-3 px-3">
              <a
                href="/"
                onClick={() => setOpen(false)}
                className="font-medium lg:hover:text-blue-700 text-blue-700 block text-[15px]"
              >
                Inicio
              </a>
            </li>
            <li className="max-lg:border-b max-lg:border-gray-300 max-lg:py-3 px-3">
              <a
                href="/blogs"
                onClick={() => setOpen(false)}
                className="font-medium lg:hover:text-blue-700 text-slate-900 block text-[15px]"
              >
                Devocionales
              </a>
            </li>
            <li className="max-lg:border-b max-lg:border-gray-300 max-lg:py-3 px-3">
              <a
                href="/music"
                onClick={() => setOpen(false)}
                className="font-medium lg:hover:text-blue-700 text-slate-900 block text-[15px]"
              >
                Music
              </a>
            </li>
          </ul>
        </div>

        {/* BUSCADOR + HAMBURGER */}
        <div className="flex gap-4 ml-auto">
          <GlobalSearch />

          {/* botón abrir menú */}
          <button onClick={() => setOpen(true)} className="lg:hidden">
            <svg className="w-7 h-7" fill="#000" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
