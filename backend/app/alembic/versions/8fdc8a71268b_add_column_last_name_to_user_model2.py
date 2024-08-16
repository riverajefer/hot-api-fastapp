"""Add column last_name to User model2

Revision ID: 8fdc8a71268b
Revises: c54f680d46f8
Create Date: 2024-08-16 00:06:25.802948

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '8fdc8a71268b'
down_revision = 'c54f680d46f8'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('user', sa.Column('last_name', sa.String(), nullable=True))
    
    
def downgrade():
    op.drop_column('user', 'last_name')
