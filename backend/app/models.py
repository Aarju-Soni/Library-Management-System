from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


def get_current_time():
    return datetime.now(timezone.utc)


class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=False)
    published_year = Column(Integer)

    borrow_records = relationship("BorrowRecord", back_populates="book", cascade="all, delete-orphan")


class Member(Base):
    __tablename__ = "members"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    joined_date = Column(DateTime(timezone=True), default=get_current_time)

    borrow_records = relationship("BorrowRecord", back_populates="member", cascade="all, delete-orphan")


class BorrowRecord(Base):
    __tablename__ = "borrow_records"
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    borrow_date = Column(DateTime(timezone=True), default=get_current_time)
    return_date = Column(DateTime(timezone=True), nullable=True)
    
    book = relationship("Book", back_populates="borrow_records")
    member = relationship("Member", back_populates="borrow_records")