define([
  "Base/Component",
  "Wall/postLike",
  "Wall/postComment",
  "Wall/postSenderBlock",
  "components/Ilenko/Common/TimeConvector",
  "components/Ilenko/Service/NetworkService",
  "css!Wall/css/post.css",
], function (
  Component,
  PostLike,
  PostComment,
  PostSenderBlock,
  Time,
  NetworkService
) {
  class Post extends Component {
    afterMount() {
      //Отключил из-за бага в json server вместо одного объекта удаляет все объекты
      // this._delete = this.getContainer().querySelector(".post-header__delete");
      // this.subscribeTo(this._delete, "click", this.onClose.bind(this));
      //AddEventListener на image
      const image = this.getContainer().querySelector(".post-header__ava");
      this.subscribeTo(image, "error", this.onErrorLoadImage.bind(this, image));
    }

    onErrorLoadImage(image) {
      image.src = "img/nophoto.jpg";
    }

    onClose() {
      //удаляет модель с сервера по id
      NetworkService.getDataComments(this.options.item.id).then((res) => {
        this.deletePost(res);
      });
      this.close();
    }

    deletePost(comments) {
      NetworkService.deleteDataPost(this.options.item.id);
      NetworkService.deleteDataLikes(this.options.item.id);
      for (let i in comments) {
        NetworkService.deleteDataComment(comments[i].id);
      }
    }

    close() {
      this.unmount();
    }
    beforeUnmount() {
      delete this._delete;
    }

    // render header(avatar, name, time and trash)
    renderUser({ item }) {
      return `<div class="post-header">
                <a class="post-header__link"href=\"https://ksupipr.github.io/tensorschool_group/?page=${item.userId}\">
                  <img class="post-header__ava" src="${item.userUrlImage}" alt="${item.userName}" title="${item.userName}">
                </a>
                <p class="post-header__name" title="${item.userName}">${item.userName}</p>
                <p class="post-header__time text_lightgray" title="Время">${Time.convert(
                    item.time
                  )}</p>
                <img class="post-header__delete" src="img/post/trash.png" alt="delete">
              </div>`;
    }

    // Рендер содержимого поста
    renderContent({ item }) {
      return `<div class="post-content">
                <span class="post-content__text">${item.postText}</span>
                ${this.renderImageInContent({ item })}
              </div>`;
    }
    //Рендер картнинки, если есть ссылка на нее)
    renderImageInContent({ item }) {
      if (item.postUrlImage != "") {
        return `<img class="post-content__img" src="${item.postUrlImage}" alt="Картинка">`;
      } else {
        return "";
      }
    }

    render({ item }) {
      return `<div class="post">
                  ${this.renderUser({ item })}
                  ${this.renderContent({ item })} 
                  ${this.childrens.create(PostLike, { item })}
                  ${this.childrens.create(PostComment, { item })}
                  ${this.childrens.create(PostSenderBlock, { item })} 
              </div>`;
    }
  }
  return Post;
});
