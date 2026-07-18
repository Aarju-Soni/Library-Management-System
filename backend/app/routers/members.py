from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.models import BorrowRecord, Member


router = APIRouter(
    prefix="/members",
    tags=["Members"],
)


@router.post("", response_model=schemas.Member)
def create_member(member: schemas.MemberCreate, db: Session = Depends(get_db)):
    new_member = Member(
        name=member.name,
        email=member.email,
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member


@router.get("", response_model=list[schemas.Member])
def get_members(db: Session = Depends(get_db)):
    return db.query(Member).all()


@router.get("/{member_id}", response_model=schemas.Member)
def get_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()

    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")

    return member


@router.put("/{member_id}", response_model=schemas.Member)
def update_member(
    member_id: int,
    updated_member: schemas.MemberCreate,
    db: Session = Depends(get_db),
):
    member = db.query(Member).filter(Member.id == member_id).first()

    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")

    member.name = updated_member.name
    member.email = updated_member.email

    db.commit()
    db.refresh(member)

    return member


@router.delete("/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()

    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")

    active_record = db.query(BorrowRecord).filter(
        BorrowRecord.member_id == member_id,
        BorrowRecord.return_date.is_(None),
    ).first()

    if active_record:
        raise HTTPException(
            status_code=400,
            detail="Member has borrowed books and cannot be deleted.",
        )

    db.delete(member)
    db.commit()

    return {
        "message": "Member deleted successfully",
    }