package handlers

import (
	"fmt"

	"messageboard/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var DB *gorm.DB

func SetDB(db *gorm.DB) {
	DB = db
}

func Index(c *gin.Context) {
	var messages []models.Message
	DB.Order("created_at desc").Find(&messages)
	fmt.Println("查到留言数：", len(messages))
	c.HTML(http.StatusOK, "index.html", gin.H{
		"messages": messages,
	})
}

func Create(c *gin.Context) {
	var msg models.Message
	if err := c.ShouldBind(&msg); err != nil {
		c.String(http.StatusBadRequest, "参数错误："+err.Error())
		return
	}
	DB.Create(&msg)
	c.Redirect(http.StatusFound, "/")
}

func EditPage(c *gin.Context) {
	id := c.Param("id")
	var msg models.Message
	if err := DB.First(&msg, id).Error; err != nil {
		c.String(http.StatusNotFound, "留言不存在")
		return
	}
	c.HTML(http.StatusOK, "edit.html", gin.H{
		"message": msg,
	})
}

func Update(c *gin.Context) {
	id := c.Param("id")
	var msg models.Message
	if err := DB.First(&msg, id).Error; err != nil {
		c.String(http.StatusNotFound, "留言不存在")
		return
	}

	var input models.Message
	if err := c.ShouldBind(&input); err != nil {
		c.String(http.StatusBadRequest, "参数错误")
		return
	}

	msg.Name = input.Name
	msg.Content = input.Content
	DB.Save(&msg)

	c.Redirect(http.StatusFound, "/")
}

func Delete(c *gin.Context) {
	id := c.Param("id")
	DB.Delete(&models.Message{}, id)
	c.Redirect(http.StatusFound, "/")
}
