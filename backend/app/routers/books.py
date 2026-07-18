from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.models import Book, BorrowRecord


router = APIRouter(
    prefix="/books",
    tags=["Books"],
)


@router.post("", response_model=schemas.Book)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    new_book = Book(
        title=book.title,
        author=book.author,
        published_year=book.published_year,
    )

    db.add(new_book)
    db.commit()
    db.refresh(new_book)

    return new_book


@router.get("", response_model=list[schemas.Book])
def get_books(db: Session = Depends(get_db)):
    return db.query(Book).all()


@router.get("/{book_id}", response_model=schemas.Book)
def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()

    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    return book


@router.put("/{book_id}", response_model=schemas.Book)
def update_book(
    book_id: int,
    updated_book: schemas.BookCreate,
    db: Session = Depends(get_db),
):
    book = db.query(Book).filter(Book.id == book_id).first()

    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    book.title = updated_book.title
    book.author = updated_book.author
    book.published_year = updated_book.published_year

    db.commit()
    db.refresh(book)

    return book


@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()

    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    db.query(BorrowRecord).filter(
        BorrowRecord.book_id == book_id
    ).delete()

    db.delete(book)
    db.commit()

    return {
        "message": "Book deleted successfully",
    }