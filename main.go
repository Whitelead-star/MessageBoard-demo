package main

import (
	"messageboard/handlers"
	"messageboard/models"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func initDB() {
	dsn := "root:123456@tcp(127.0.0.1:3306)/messageboard?charset=utf8mb4&parseTime=True&loc=UTC"

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("数据库连接失败：" + err.Error())
	}

	err = DB.AutoMigrate(&models.Message{})
	if err != nil {
		panic("建表失败：" + err.Error())
	}

	println("数据库连接成功，表已就绪")
}

func main() {
	initDB()

	handlers.SetDB(DB)

	r := gin.Default()
	r.SetTrustedProxies(nil)

	r.LoadHTMLGlob("templates/*")

	r.Static("/static", "./static")

	r.GET("/", handlers.Index)
	r.POST("/messages", handlers.Create)
	r.GET("/messages/:id/edit", handlers.EditPage)
	r.POST("/messages/:id", handlers.Update)
	r.POST("/messages/:id/delete", handlers.Delete)

	r.Run(":8080")
}
