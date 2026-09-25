package models

import (
	"gorm.io/gorm"
)

type Message struct {
	gorm.Model
	Name    string `form:"name" binding:"required"`
	Content string `form:"content" binging:"required"`
}
