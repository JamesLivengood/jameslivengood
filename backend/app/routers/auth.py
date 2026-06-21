import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, GuestClaim, Token, UserResponse
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


@router.post("/guest", response_model=Token)
def create_guest(db: Session = Depends(get_db)):
    guest_id = uuid.uuid4().hex[:12]
    user = User(
        email=f"guest_{guest_id}@guest.local",
        username=f"guest_{guest_id}",
        full_name="Guest",
        hashed_password=hash_password(uuid.uuid4().hex[:32]),
        is_guest=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/claim", response_model=Token)
def claim_guest(claim: GuestClaim, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_guest:
        raise HTTPException(status_code=400, detail="Account is already registered")
    if db.query(User).filter(User.email == claim.email, User.id != current_user.id).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == claim.username, User.id != current_user.id).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    current_user.email = claim.email
    current_user.username = claim.username
    current_user.full_name = claim.full_name
    current_user.hashed_password = hash_password(claim.password)
    current_user.is_guest = False
    db.commit()
    db.refresh(current_user)

    token = create_access_token({"sub": str(current_user.id)})
    return Token(access_token=token, user=UserResponse.model_validate(current_user))


@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, user=UserResponse.model_validate(user))
