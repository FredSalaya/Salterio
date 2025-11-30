// src/components/BlogCard.jsx
import { FaHeadphones, FaYoutube, FaSpotify } from "react-icons/fa";

export default function BlogCard({
  titulo,
  resumen,
  fecha,
  imagen_url,
  blog_url,
  podcast_url,
  video_url,
  autor_nombre,
  autor_foto,
}) {
  // Formatea fecha
  const fechaObj = fecha ? new Date(fecha) : null;
  const mes = fechaObj ? fechaObj.toLocaleString('default', { month: 'short' }).toUpperCase() : '';
  const dia = fechaObj ? fechaObj.getDate() : '';
  const anio = fechaObj ? fechaObj.getFullYear() : '';

  return (
    <article className="flex bg-white transition hover:shadow-xl">
      <div className="rotate-180 p-2 [writing-mode:_vertical-lr]">
        <time
          dateTime="2022-10-10"
          className="flex items-center justify-between gap-4 text-xs font-bold text-gray-900 uppercase"
        >
          <span>{anio}</span>
          <span className="w-px flex-1 bg-gray-900/10"></span>
          <span>{dia} {mes}</span>
        </time>
      </div>

      <div className="basis-56 min-h-[96px]  sm:block sm:basis-56">
        <img
          alt={titulo}
          src={imagen_url || '/img/no-image.png'}
          className="aspect-square h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="border-s border-gray-900/10 p-4 border-l-transparent p-6">
          <a href="#">
            <h3 className="font-bold text-gray-900 uppercase">
              {titulo}
            </h3>
          </a>

          <p className="mt-2 line-clamp-4 text-sm/relaxed text-gray-700">
            {resumen}
          </p>
        </div>


        <div className="flex items-end justify-end">
          {podcast_url && (
            <a
              href={podcast_url}
              className="m-2 flex items-center gap-1 px-4 py-2 rounded-full bg-green-50 text-green-700 font-bold text-sm hover:bg-green-100 transition"
              target="_blank"
            >
              <FaSpotify className="inline" />
            </a>
          )}
          {video_url && (
            <a
              href={video_url}
              className="m-2 flex items-center gap-1 px-4 py-2 rounded-full bg-pink-50 text-pink-600 font-bold text-sm hover:bg-pink-100 transition"
              target="_blank"
            >
              <FaYoutube className="inline" />
            </a>
          )}
          <a
            href={blog_url}
            className="block bg-yellow-300 px-5 py-3 text-center text-xs font-bold text-gray-900 uppercase transition hover:bg-yellow-400"
          >
            Leer
          </a>
        </div>
      </div>
    </article>




  );
}
