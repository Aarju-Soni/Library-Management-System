from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import engine, get_db
from app.models import Base, Book, Member, BorrowRecord
from app import schemas


Base.metadata.create_all(bind=engine)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://library-management-system-vert-pi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Library Management"}


# ======================
# BOOK APIs
# ======================


@app.post("/books", response_model=schemas.Book)
def create_book(
    book: schemas.BookCreate,
    db: Session = Depends(get_db)
):
    new_book = Book(
        title=book.title,
        author=book.author,
        published_year=book.published_year
    )

    db.add(new_book)
    db.commit()
    db.refresh(new_book)

    return new_book



@app.get("/books", response_model=list[schemas.Book])
def get_books(db: Session = Depends(get_db)):
    return db.query(Book).all()



@app.get("/books/{book_id}", response_model=schemas.Book)
def get_book(
    book_id: int,
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(
        Book.id == book_id
    ).first()

    if book is None:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    return book



@app.put("/books/{book_id}", response_model=schemas.Book)
def update_book(
    book_id: int,
    updated_book: schemas.BookCreate,
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(
        Book.id == book_id
    ).first()

    if book is None:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    book.title = updated_book.title
    book.author = updated_book.author
    book.published_year = updated_book.published_year

    db.commit()
    db.refresh(book)

    return book



@app.delete("/books/{book_id}")
def delete_book(
    book_id: int,
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(
        Book.id == book_id
    ).first()

    if book is None:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    db.query(BorrowRecord).filter(
        BorrowRecord.book_id == book_id
    ).delete()

    db.delete(book)
    db.commit()

    return {
        "message": "Book deleted successfully"
    }



# ======================
# MEMBER APIs
# ======================


@app.post("/members", response_model=schemas.Member)
def create_member(
    member: schemas.MemberCreate,
    db: Session = Depends(get_db)
):
    new_member = Member(
        name=member.name,
        email=member.email
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member



@app.get("/members", response_model=list[schemas.Member])
def get_members(db: Session = Depends(get_db)):
    return db.query(Member).all()



@app.get("/members/{member_id}", response_model=schemas.Member)
def get_member(
    member_id: int,
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(
        Member.id == member_id
    ).first()

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    return member



@app.put("/members/{member_id}", response_model=schemas.Member)
def update_member(
    member_id: int,
    updated_member: schemas.MemberCreate,
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(
        Member.id == member_id
    ).first()

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    member.name = updated_member.name
    member.email = updated_member.email

    db.commit()
    db.refresh(member)

    return member



@app.delete("/members/{member_id}")
def delete_member(
    member_id: int,
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(
        Member.id == member_id
    ).first()

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )


    active_record = db.query(BorrowRecord).filter(
        BorrowRecord.member_id == member_id,
        BorrowRecord.return_date == None
    ).first()


    if active_record:
        raise HTTPException(
            status_code=400,
            detail="Member has borrowed books and cannot be deleted."
        )


    db.delete(member)
    db.commit()

    return {
        "message": "Member deleted successfully"
    }



# ======================
# BORROW APIs
# ======================


@app.post("/borrow", response_model=schemas.BorrowRecord)
def borrow_book(
    record: schemas.BorrowRecordCreate,
    db: Session = Depends(get_db)
):

    book = db.query(Book).filter(
        Book.id == record.book_id
    ).first()


    if book is None:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )


    active_borrow = db.query(BorrowRecord).filter(
        BorrowRecord.book_id == record.book_id,
        BorrowRecord.return_date == None
    ).first()


    if active_borrow:
        raise HTTPException(
            status_code=400,
            detail="Book is already borrowed"
        )


    member = db.query(Member).filter(
        Member.id == record.member_id
    ).first()


    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )


    new_record = BorrowRecord(
        book_id=record.book_id,
        member_id=record.member_id,
        borrow_date=datetime.utcnow()
    )


    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return new_record



@app.put("/borrow/{record_id}/return", response_model=schemas.BorrowRecord)
def return_book(
    record_id: int,
    db: Session = Depends(get_db)
):

    record = db.query(BorrowRecord).filter(
        BorrowRecord.id == record_id
    ).first()


    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Borrow record not found"
        )


    if record.return_date is not None:
        raise HTTPException(
            status_code=400,
            detail="Book already returned"
        )


    record.return_date = datetime.utcnow()

    db.commit()
    db.refresh(record)

    return record



@app.get("/borrow", response_model=list[schemas.BorrowRecord])
def get_borrow_records(
    db: Session = Depends(get_db)
):
    return db.query(BorrowRecord).all()