from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.models import Book, Member, BorrowRecord


router = APIRouter(
    prefix="/borrow",
    tags=["Borrow"],
)


@router.post("", response_model=schemas.BorrowRecord)
def borrow_book(record: schemas.BorrowRecordCreate, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == record.book_id).first()

    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    active_borrow = db.query(BorrowRecord).filter(
        BorrowRecord.book_id == record.book_id,
        BorrowRecord.return_date.is_(None),
    ).first()

    if active_borrow:
        raise HTTPException(status_code=400, detail="Book is already borrowed")

    member = db.query(Member).filter(Member.id == record.member_id).first()

    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")

    new_record = BorrowRecord(
        book_id=record.book_id,
        member_id=record.member_id,
        borrow_date=datetime.now(),
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return new_record


@router.put("/{record_id}/return", response_model=schemas.BorrowRecord)
def return_book(record_id: int, db: Session = Depends(get_db)):
    record = db.query(BorrowRecord).filter(
        BorrowRecord.id == record_id
    ).first()

    if record is None:
        raise HTTPException(status_code=404, detail="Borrow record not found")

    if record.return_date is not None:
        raise HTTPException(status_code=400, detail="Book already returned")

    record.return_date = datetime.now()

    db.commit()
    db.refresh(record)

    return record


@router.get("", response_model=list[schemas.BorrowRecord])
def get_borrow_records(db: Session = Depends(get_db)):
    return db.query(BorrowRecord).all()


@router.delete("/{record_id}")
def delete_borrow_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(BorrowRecord).filter(
        BorrowRecord.id == record_id
    ).first()

    if record is None:
        raise HTTPException(status_code=404, detail="Borrow record not found")

    db.delete(record)
    db.commit()

    return {
        "message": "Borrow record deleted successfully",
    }