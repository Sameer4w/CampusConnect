function Pagination({
  page,
  pages,
  onPageChange,
}) {
  if (pages <= 1) {
    return null;
  }

  const numbers = [];

  for (
    let i = 1;
    i <= pages;
    i++
  ) {
    numbers.push(i);
  }

  return (
    <div
      className="pagination"
    >
      <button
        type="button"
        disabled={
          page === 1
        }
        onClick={() =>
          onPageChange(
            page - 1
          )
        }
      >
        Previous
      </button>

      {numbers.map(
        (number) => (
          <button
            key={number}
            type="button"
            className={
              number === page
                ? "active"
                : ""
            }
            onClick={() =>
              onPageChange(
                number
              )
            }
          >
            {number}
          </button>
        )
      )}

      <button
        type="button"
        disabled={
          page === pages
        }
        onClick={() =>
          onPageChange(
            page + 1
          )
        }
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;