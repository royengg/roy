export type WatchlistItem = {
  title: string;
  year: string;
  poster: string;
  posterAlt: string;
};

export const watchlist: WatchlistItem[] = [
  {
    title: "The Good Doctor",
    year: "2017",
    poster: "/posters/the-good-doctor-2017.jpg",
    posterAlt: "The Good Doctor series poster featuring Freddie Highmore as Shaun Murphy",
  },
  {
    title: "Dexter",
    year: "2006",
    poster: "/posters/dexter-2006.jpg",
    posterAlt: "Dexter series poster featuring Michael C. Hall as Dexter Morgan",
  },
  {
    title: "House",
    year: "2004",
    poster: "/posters/house-2004.jpg",
    posterAlt: "House M.D. series poster featuring Hugh Laurie as Gregory House",
  },
  {
    title: "True Detective · Season 1",
    year: "2014",
    poster: "/posters/true-detective-season-1-2014.jpg",
    posterAlt: "True Detective season one poster showing two detectives beside a car",
  },
];
