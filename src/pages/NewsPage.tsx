import React, { useEffect } from "react";
import { useGetNews } from "../hooks/useGetNews";
import NewsList from "../components/NewsList";

const NewsPage = () => {
  let query = "APPLE";
  let page = 1;
  const { data, error, isLoading } = useGetNews(query, page);

  useEffect(() => {
    if (data) {
      console.log("data :", data);
    }
  }, [data]);

  return (
    <div>
      NewsPage
      <NewsList articles={data} loading={isLoading} error={error} />
    </div>
  );
};
export default NewsPage;
