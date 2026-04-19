import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";
import toast, { Toaster } from "react-hot-toast";
import css from "./App.module.css";

export default function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isError, isSuccess, isPending, isFetching } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: query !== "",
    placeholderData: keepPreviousData,
  });

  const handleSearch = (newQuery: string) => {
    toast.dismiss();
    setQuery(newQuery);
    setPage(1);
  };

  const movies = data?.results ?? [];
  const totalPages = data?.total_pages ?? 0;

  useEffect(() => {
    if (isSuccess && movies.length === 0 && query) {
      toast.error("No movies found for your request.");
    }
  }, [isSuccess, movies.length, query]);

  return (
    <>
      <SearchBar onSubmit={handleSearch} />

      {(isPending || isFetching) && <Loader />}

      {isError && <ErrorMessage />}

      {movies.length > 0 && (
        <MovieGrid movies={movies} onSelect={setSelectedMovie} />
      )}

      {totalPages > 1 && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      <Toaster position="top-center" />
    </>
  );
}
